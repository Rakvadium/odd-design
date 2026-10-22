# Records what NVDA does, for sr.ts. Loaded from the run's scratchpad dir, never installed.
# Appends one JSON object per line to events.jsonl in the run's NVDA config dir:
#   focus   NVDA's focus moved: role, name, states, and the app (sr.ts waits on these)
#   key     a gesture NVDA received (before it decides whether to handle it or pass it on)
#   speech  a sequence NVDA sent to the synth: the spoken text, with [beep] / [sound] markers
#   cancel  NVDA cancelled speech, so anything still queued was cut off
#   done    the synth finished speaking
#   beep    a tone (NVDA's progress and mode beeps)
#   sound   a wave file (NVDA's earcons, such as the browse and focus mode sounds)
# Times are Unix seconds (time.time()), the same clock as Date.now() / 1000 in Bun.
import json
import os
import threading
import time

import buildVersion
import config
import globalPluginHandler
import globalVars
import inputCore
import nvwave
import speech
import synthDriverHandler
import tones
from speech.commands import BeepCommand, WaveFileCommand


def _text(sequence):
	parts = []
	for item in sequence:
		if isinstance(item, str):
			if item.strip():
				parts.append(item.strip())
		elif isinstance(item, BeepCommand):
			parts.append("[beep]")
		elif isinstance(item, WaveFileCommand):
			parts.append("[sound]")
	return " ".join(parts)


class GlobalPlugin(globalPluginHandler.GlobalPlugin):
	def __init__(self):
		super().__init__()
		self._lock = threading.Lock()
		self._file = open(os.path.join(globalVars.appArgs.configPath, "events.jsonl"), "a", encoding="utf-8")
		self._registered = []
		self._register(speech.extensions.pre_speech, self._onSpeech)
		self._register(speech.extensions.speechCanceled, self._onCancel)
		self._register(synthDriverHandler.synthDoneSpeaking, self._onDone)
		self._register(inputCore.decide_executeGesture, self._onGesture)
		self._register(tones.decide_beep, self._onBeep)
		self._register(nvwave.decide_playWaveFile, self._onWave)
		synth = synthDriverHandler.getSynth()
		self._write(
			"ready",
			pid=os.getpid(),
			nvda=buildVersion.version,
			synth=synth.name,
			voice=getattr(synth, "voice", ""),
			rate=getattr(synth, "rate", None),
			symbolLevel=config.conf["speech"]["symbolLevel"],
			sayAllOnPageLoad=config.conf["virtualBuffers"]["autoSayAllOnPageLoad"],
		)

	def _register(self, point, handler):
		point.register(handler)
		self._registered.append((point, handler))

	def _write(self, kind, **fields):
		line = json.dumps({"t": time.time(), "kind": kind, **fields})
		with self._lock:
			self._file.write(line + "\n")
			self._file.flush()

	def event_gainFocus(self, obj, nextHandler):
		self._write(
			"focus",
			role=getattr(obj.role, "displayString", str(obj.role)),
			name=obj.name or "",
			states=sorted(getattr(s, "displayString", str(s)) for s in obj.states),
			app=getattr(obj.appModule, "appName", ""),
		)
		nextHandler()

	def _onSpeech(self, speechSequence=None, **kwargs):
		self._write("speech", text=_text(speechSequence or []))

	def _onCancel(self, **kwargs):
		self._write("cancel")

	def _onDone(self, **kwargs):
		self._write("done")

	def _onGesture(self, gesture=None, **kwargs):
		self._write("key", name=getattr(gesture, "displayName", ""), ids=list(getattr(gesture, "normalizedIdentifiers", [])))
		return True

	def _onBeep(self, frequency=0, duration=0, **kwargs):
		self._write("beep", hz=frequency, ms=duration)
		return True

	def _onWave(self, fileName="", **kwargs):
		self._write("sound", file=os.path.basename(fileName))
		return True

	def terminate(self):
		for point, handler in self._registered:
			point.unregister(handler)
		self._write("exit")
		self._file.close()
		super().terminate()

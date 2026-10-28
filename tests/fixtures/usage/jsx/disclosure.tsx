// expect: ODD-DISCLOSURE-002 ODD-DISCLOSURE-002 ODD-DISCLOSURE-001 ODD-DISCLOSURE-003 ODD-STATIC-001 ODD-STATIC-001 ODD-DISCLOSURE-002 ODD-STATIC-001
import { Disclosure } from "odd-design/react";
import { FaqQuestion } from "./faq-question";
declare const faq: { question: string; answer: string; open: boolean };
declare function sync(event: { newState: string }): void;
declare const answer: React.ReactNode;
declare const props: { children?: React.ReactNode; name?: string };
export const view = (
  <>
    <Disclosure name="faq" open><summary>Does it need JavaScript?</summary><div>No.</div></Disclosure>
    <Disclosure name="faq" open={faq.open} onToggle={sync}><summary>{faq.question}</summary><div>{faq.answer}</div></Disclosure>
    <Disclosure><><summary>Does it need JavaScript?</summary><div>No.</div></></Disclosure>
    <Disclosure><FaqQuestion /><div>No.</div></Disclosure>
    <Disclosure>{answer}</Disclosure>
    <Disclosure><div>Does it need JavaScript?</div><div>No.</div></Disclosure>
    <Disclosure><div><summary>Does it need JavaScript?</summary></div><div>No.</div></Disclosure>
    <div className="odd-disclosure"><summary>Does it need JavaScript?</summary></div>
    <Disclosure data-tone="info"><summary>Does it need JavaScript?</summary><div>No.</div></Disclosure>
    <Disclosure {...props} />
    <details className="odd-disclosure" {...props} />
    <Disclosure {...props}><div>Does it need JavaScript?</div></Disclosure>
  </>
);

# Avatar usage rules

These codes apply to `odd-avatar` and `odd-avatar-group`. Shared codes are in [General usage rules](general.md).

```html
<span class="odd-avatar"><img src="kai.png" alt="Kai Nakamura"></span>
<span class="odd-avatar" data-size="lg" role="img" aria-label="Ana Rojas">AR</span>
<div class="odd-avatar-group" role="group" aria-label="Collaborators">
  <span class="odd-avatar"><img src="mira.png" alt="Mira Okafor"></span>
  <span class="odd-avatar" role="img" aria-label="and 3 more">+3</span>
</div>
<span class="odd-avatar" aria-hidden="true">MO</span> Mira Okafor
```

An avatar is named in one of three ways. An image avatar's `img` has `alt`. An initials avatar is `role="img"` with an `aria-label`. An avatar next to a visible name repeats it, so hide it with `aria-hidden="true"` or `alt=""`. In React, `Avatar` renders the `span` and `AvatarGroup` renders the `div`. Pass `size` to `Avatar`. The `img`, the initials, and the name stay yours.

`avatarFallback` from `odd-design/enhance` swaps a failed image for the initials in `data-initials`. It replaces the avatar's children, so it is for markup the page owns. React throws on its next render of children a script replaced, so `data-initials` on `Avatar` is a type error. In React, render the initials when the image's `onError` fires.

## ODD-AVATAR-001

Fails when `odd-avatar` is not on a `span`, or `odd-avatar-group` is not on a `div`.

An avatar sits inline, beside a name in a sentence or inside a button, where a `div` is not allowed. The group holds the avatars and is a block of its own.

| Class | Element |
| --- | --- |
| `odd-avatar` | `span` |
| `odd-avatar-group` | `div` |

Move the class onto its element. In React, use `Avatar` and `AvatarGroup`, which render those elements.

## ODD-AVATAR-002

Fails when `data-size` is not `sm` or `lg`.

`avatar.css` selects only those two. The default size is the look of no attribute, so `md` and `medium` mean remove the attribute. Any other value keeps the default size, so a misspelled size looks like a working default.

Set `sm` or `lg`, or remove `data-size`. In React, `size` is `AvatarSize`, and `size="md"` is a type error.

## ODD-AVATAR-003

Fails when `odd-avatar` has a `role` other than `img`, or `odd-avatar-group` has no `role` or a `role` other than `group`.

An initials avatar is text that stands for a person, so `role="img"` makes it one named image. An image avatar needs no role, because its `img` is the image. `role="presentation"` or `role="none"` does not hide the initials, which are still read. The group's `role="group"` lets its name describe the set.

Set `role="img"` on an initials avatar and leave it off an image avatar. To hide an avatar, use `aria-hidden="true"`. Set `role="group"` on the group. In React, `role` on `Avatar` takes only `"img"`, and `AvatarGroup` requires `role="group"`.

## ODD-AVATAR-004

Fails when an `odd-avatar` with `role="img"`, or an `odd-avatar-group` with `role="group"`, has no non-empty `aria-label` or `aria-labelledby`. A blank name such as `aria-label=" "` fails too.

An image role with no name is read as an unnamed image, and the initials inside it are not read. A group with no name is read as a group with no hint of who is in it.

Add `aria-label` with the person's name, such as `Ana Rojas`, or `aria-labelledby` that points at it. Name a group for the set, such as `Collaborators`. In React, `role="img"` on `Avatar`, or an `AvatarGroup`, with neither name is a type error.

## ODD-AVATAR-005

Fails when `odd-avatar` has a system `data-` attribute it does not take.

An avatar reads `data-size` and nothing else. `data-tone` and `data-variant` belong to other components, and `avatar.css` ignores them. An app `data-` attribute passes, and so does `data-initials`, which `avatarFallback` reads. The appearance axes and the headless allowlist pass. A misspelled size attribute, such as `data-szie`, is reported with a suggested spelling.

Remove the attribute, or correct its name. The avatar takes `data-size`. In React, pass `size`. Passing `data-tone` is a type error, and passing `data-size` yourself is a type error too, because `Avatar` sets that attribute from `size`.

## ODD-AVATAR-006

Fails when `odd-avatar-group` has a system `data-` attribute.

The group reads no `data-` attribute. `data-size` on the group does nothing, because `avatar.css` selects the size on each `odd-avatar`. An app `data-` attribute passes. The appearance axes and the headless allowlist pass.

Remove the attribute. Put `data-size` on each avatar. In React, `data-size` on `AvatarGroup` is a type error.

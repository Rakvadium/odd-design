// expect: ODD-AVATAR-002 ODD-AVATAR-003 ODD-AVATAR-004 ODD-AVATAR-005 ODD-AVATAR-006 ODD-AVATAR-004 ODD-AVATAR-001
import { Avatar, AvatarGroup } from "odd-design/react";
export const view = (
  <>
    <AvatarGroup role="group" aria-label="Collaborators">
      <Avatar role="img" aria-label="Ana Rojas">AR</Avatar>
    </AvatarGroup>
    <Avatar size="md" aria-hidden="true">AR</Avatar>
    <Avatar role="presentation">AR</Avatar>
    <Avatar role="img">AR</Avatar>
    <Avatar data-tone="info" aria-hidden="true">AR</Avatar>
    <AvatarGroup role="group" aria-label="Team" data-size="sm" />
    <AvatarGroup role="group" />
    <div className="odd-avatar" aria-hidden="true">AR</div>
  </>
);

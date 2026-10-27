import type { ReactElement } from "react";
import type { AvatarGroupRule, AvatarRule } from "../js/usage/contract.ts";
import { part, type Contract, type Message, type Native, type Values } from "./part.ts";

export type AvatarSize = Values<AvatarRule, "data-size">;

interface AvatarContract extends Contract<"Avatar", AvatarRule> {
  role?: Values<AvatarRule, "role">;
  /** avatarFallback replaces the children of an avatar with data-initials, and React throws on its next render of them. Render the initials yourself when the image fails. */
  "data-initials"?: never;
}

export interface AvatarProps extends AvatarContract, Native<"Avatar", keyof AvatarContract> {}

interface AvatarGroupContract extends Contract<"AvatarGroup", AvatarGroupRule> {}

export interface AvatarGroupProps extends AvatarGroupContract, Native<"AvatarGroup", keyof AvatarGroupContract> {}

type Unnamed<Rule> = { [Name in Extract<Rule, { kind: "accessible-name"; names: readonly string[] }>["names"][number]]?: undefined };

type NamedWhenRole<P, Rule> = P extends { role: Values<Rule, "role"> } & Unnamed<Rule> ? Message<"ODD-AVATAR-004"> : P;

export const Avatar: <const P extends AvatarProps>(props: NamedWhenRole<P, AvatarRule> & AvatarProps) => ReactElement = part("Avatar");
export const AvatarGroup: <const P extends AvatarGroupProps>(props: NamedWhenRole<P, AvatarGroupRule> & AvatarGroupProps) => ReactElement = part("AvatarGroup");

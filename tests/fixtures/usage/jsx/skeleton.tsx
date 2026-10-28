// expect: ODD-SKELETON-002 ODD-SKELETON-003 ODD-SKELETON-003 ODD-SKELETON-004 ODD-SKELETON-004 ODD-SKELETON-005 ODD-SKELETON-001
import { Skeleton } from "odd-design/react";
export const view = (
  <>
    <Skeleton aria-hidden="true" shape="avatar" />
    <Skeleton aria-hidden="true" shape="circle" />
    <Skeleton />
    <Skeleton aria-hidden />
    <Skeleton aria-hidden="true">Loading</Skeleton>
    <Skeleton aria-hidden="true" aria-busy="true" />
    <Skeleton aria-hidden="true" data-size="lg" />
    <span className="odd-skeleton" aria-hidden="true" />
  </>
);

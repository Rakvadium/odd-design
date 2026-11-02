// expect: ODD-CODE-002 ODD-CODE-001 ODD-CODE-001
import { Code, Pre } from "odd-design/react";
export const view = (
  <>
    <p>Set <Code>--primary</Code> on the scope.</p>
    <Pre data-language="sh"><code>bun add odd-design</code></Pre>
    <Pre data-size="sm"><code>bun add odd-design</code></Pre>
    <p>Set <span className="odd-code">--primary</span> on the scope.</p>
    <div className="odd-pre">bun add odd-design</div>
  </>
);

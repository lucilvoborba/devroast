"use client";

import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";

const defaultCode = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

export function CodeEditor() {
	return (
		<div className="border border-border-primary rounded-lg overflow-hidden bg-bg-input">
			<div className="flex items-center h-10 px-4 border-b border-border-primary">
				<div className="flex gap-2">
					<span className="w-3 h-3 rounded-full bg-accent-red" />
					<span className="w-3 h-3 rounded-full bg-accent-amber" />
					<span className="w-3 h-3 rounded-full bg-accent-green" />
				</div>
			</div>
			<CodeMirror
				value={defaultCode}
				height="320px"
				extensions={[javascript()]}
				theme="dark"
				basicSetup={{
					lineNumbers: true,
					foldGutter: false,
					highlightActiveLine: false,
				}}
				style={{
					fontSize: "13px",
					fontFamily: "var(--font-mono, monospace)",
					backgroundColor: "#111111",
				}}
			/>
		</div>
	);
}

import { ArrowRight, Plus } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import {
	BadgeDot,
	BadgeLabel,
	BadgeRoot,
	Button,
	CardBody,
	CardHeader,
	CardRoot,
	CodeBlockBody,
	CodeBlockContent,
	CodeBlockFileName,
	CodeBlockHeader,
	CodeBlockLineNumbers,
	CodeBlockRoot,
	DiffLine,
	ScoreRing,
	TableRowCode,
	TableRowLanguage,
	TableRowRank,
	TableRowRoot,
	TableRowScore,
} from "@/components/ui";
import { ToggleDemo } from "./toggle-demo";

export default function UIShowcasePage() {
	const sampleCode = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

	return (
		<main className="min-h-screen bg-bg-page p-8">
			<h1 className="text-2xl font-mono mb-12 text-text-primary">
				<span className="text-accent-green">{"//"}</span> component_library
			</h1>

			<div className="space-y-16">
				<section>
					<h2 className="font-mono text-sm mb-6 text-text-primary">
						<span className="text-accent-green">{"//"}</span> buttons
					</h2>
					<div className="space-y-4">
						<div className="flex flex-wrap gap-4">
							<Button>Default</Button>
							<Button variant="secondary">Secondary</Button>
							<Button variant="destructive">Destructive</Button>
							<Button variant="outline">Outline</Button>
							<Button variant="ghost">Ghost</Button>
							<Button variant="link">Link</Button>
						</div>
						<div className="flex items-center gap-4">
							<Button size="sm">Small</Button>
							<Button size="md">Medium</Button>
							<Button size="lg">Large</Button>
						</div>
						<div className="flex flex-wrap gap-4">
							<Button disabled>Disabled</Button>
							<Button loading>Loading</Button>
							<Button leftIcon={<Plus />}>Left Icon</Button>
							<Button rightIcon={<ArrowRight />}>Right Icon</Button>
						</div>
					</div>
				</section>

				<section>
					<h2 className="font-mono text-sm mb-6 text-text-primary">
						<span className="text-accent-green">{"//"}</span> toggle
					</h2>
					<ToggleDemo />
				</section>

				<section>
					<h2 className="font-mono text-sm mb-6 text-text-primary">
						<span className="text-accent-green">{"//"}</span> badge_status
					</h2>
					<div className="flex flex-wrap gap-6">
						<BadgeRoot variant="critical">
							<BadgeDot />
							<BadgeLabel>critical</BadgeLabel>
						</BadgeRoot>
						<BadgeRoot variant="warning">
							<BadgeDot />
							<BadgeLabel>warning</BadgeLabel>
						</BadgeRoot>
						<BadgeRoot variant="good">
							<BadgeDot />
							<BadgeLabel>good</BadgeLabel>
						</BadgeRoot>
					</div>
				</section>

				<section>
					<h2 className="font-mono text-sm mb-6 text-text-primary">
						<span className="text-accent-green">{"//"}</span> cards
					</h2>
					<div className="flex flex-wrap gap-4">
						<CardRoot className="w-[480px]">
							<CardHeader>
								<BadgeRoot variant="critical">
									<BadgeDot />
									<BadgeLabel>critical</BadgeLabel>
								</BadgeRoot>
							</CardHeader>
							<CardBody>
								<div className="space-y-2">
									<p className="text-sm text-text-primary font-mono">
										using var instead of const/let
									</p>
									<p className="text-xs text-text-secondary">
										the var keyword is function-scoped rather than block-scoped,
										which can lead to unexpected behavior and bugs.
									</p>
								</div>
							</CardBody>
						</CardRoot>
						<CardRoot className="w-[480px]">
							<CardHeader>
								<BadgeRoot variant="good">
									<BadgeDot />
									<BadgeLabel>good</BadgeLabel>
								</BadgeRoot>
							</CardHeader>
							<CardBody>
								<div className="space-y-2">
									<p className="text-sm text-text-primary font-mono">
										clean variable naming
									</p>
									<p className="text-xs text-text-secondary">
										variable names are descriptive and follow consistent naming
										conventions.
									</p>
								</div>
							</CardBody>
						</CardRoot>
					</div>
				</section>

				<section>
					<h2 className="font-mono text-sm mb-6 text-text-primary">
						<span className="text-accent-green">{"//"}</span> code_editor
					</h2>
					<div className="w-full max-w-3xl">
						<CodeEditor
							showLanguageSelector
							showLineNumbers
							placeholder="paste your code here..."
						/>
					</div>
				</section>

				<section>
					<h2 className="font-mono text-sm mb-6 text-text-primary">
						<span className="text-accent-green">{"//"}</span> code_block
					</h2>
					<CodeBlockRoot className="w-[560px]">
						<CodeBlockHeader>
							<div className="flex gap-2">
								<span className="w-2.5 h-2.5 rounded-full bg-accent-red" />
								<span className="w-2.5 h-2.5 rounded-full bg-accent-amber" />
								<span className="w-2.5 h-2.5 rounded-full bg-accent-green" />
							</div>
							<span className="flex-1" />
							<CodeBlockFileName>calculate.js</CodeBlockFileName>
						</CodeBlockHeader>
						<CodeBlockBody>
							<CodeBlockLineNumbers code={sampleCode} />
							<CodeBlockContent code={sampleCode} language="javascript" />
						</CodeBlockBody>
					</CodeBlockRoot>
				</section>

				<section>
					<h2 className="font-mono text-sm mb-6 text-text-primary">
						<span className="text-accent-green">{"//"}</span> diff_line
					</h2>
					<div className="w-[560px] rounded-lg overflow-hidden border border-border-primary">
						<DiffLine variant="removed" code="var total = 0;" />
						<DiffLine variant="added" code="const total = 0;" />
						<DiffLine
							variant="context"
							code="for (let i = 0; i < items.length; i++) {"
						/>
					</div>
				</section>

				<section>
					<h2 className="font-mono text-sm mb-6 text-text-primary">
						<span className="text-accent-green">{"//"}</span> table_row
					</h2>
					<div className="w-[700px] border border-border-primary rounded-lg overflow-hidden">
						<TableRowRoot>
							<TableRowRank>#1</TableRowRank>
							<TableRowScore score={9.2}>9.2</TableRowScore>
							<TableRowCode>
								function calculateTotal(items) {"{"} const total = 0; ... {"}"}
							</TableRowCode>
							<TableRowLanguage>javascript</TableRowLanguage>
						</TableRowRoot>
						<TableRowRoot>
							<TableRowRank>#2</TableRowRank>
							<TableRowScore score={7.5}>7.5</TableRowScore>
							<TableRowCode>
								def process_data(data): return sorted(data, key=lambda x:
								x[&apos;score&apos;])
							</TableRowCode>
							<TableRowLanguage>python</TableRowLanguage>
						</TableRowRoot>
						<TableRowRoot>
							<TableRowRank>#3</TableRowRank>
							<TableRowScore score={3.1}>3.1</TableRowScore>
							<TableRowCode>
								var total = 0; for (var i = 0; i &lt; items.length; i++) {"{"}{" "}
								total += items[i]; {"}"}
							</TableRowCode>
							<TableRowLanguage>javascript</TableRowLanguage>
						</TableRowRoot>
					</div>
				</section>

				<section>
					<h2 className="font-mono text-sm mb-6 text-text-primary">
						<span className="text-accent-green">{"//"}</span> score_ring
					</h2>
					<div className="flex items-center gap-8">
						<ScoreRing score={3.5} />
						<ScoreRing score={7.2} />
						<ScoreRing score={9.8} />
					</div>
				</section>
			</div>
		</main>
	);
}

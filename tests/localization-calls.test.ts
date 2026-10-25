import { expect, it } from 'vitest';
import ts from 'typescript';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import en from '../src/core/localization/messages/en.json';

it('supplies every required placeholder at literal translation call sites', () => {
  const failures: string[] = [];
  function scan(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) scan(path);
      else if (/\.tsx?$/.test(path)) {
        const source = ts.createSourceFile(
          path,
          readFileSync(path, 'utf8'),
          ts.ScriptTarget.Latest,
          true,
        );
        function visit(node: ts.Node) {
          if (
            (ts.isCallExpression(node) || ts.isNewExpression(node)) &&
            [
              't',
              'LocalizedError',
              'TimelineValidationError',
              'ContentLimitError',
            ].includes(node.expression.getText(source))
          ) {
            const [key, params] = node.arguments ?? [];
            if (key && ts.isStringLiteral(key)) {
              const text = en[key.text as keyof typeof en];
              if (text === undefined)
                failures.push(`${path}: unknown ${key.text}`);
              else {
                const expected = [...text.matchAll(/\{(\w+)\}/g)].map(
                  (m) => m[1],
                );
                if (
                  expected.length &&
                  (!params || ts.isObjectLiteralExpression(params))
                ) {
                  const actual =
                    params && ts.isObjectLiteralExpression(params)
                      ? params.properties.map((p) => p.name?.getText(source))
                      : [];
                  for (const required of expected)
                    if (!actual.includes(required))
                      failures.push(`${path}: ${key.text} lacks ${required}`);
                }
              }
            }
          }
          ts.forEachChild(node, visit);
        }
        visit(source);
      }
    }
  }
  scan('src');
  expect(failures).toEqual([]);
});

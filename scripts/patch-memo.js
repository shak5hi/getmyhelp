const fs = require('fs');

function patchArrowComponent(path, name) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(
    new RegExp(`export const ${name}: React\\.FC<([^>]+)> = \\(\\{`),
    `export const ${name}: React.FC<$1> = React.memo(({`
  );
  content = content.replace(
    /};\s*$/,
    '});\n'
  );
  fs.writeFileSync(path, content, 'utf8');
  console.log(`Patched ${name}`);
}

function patchFunctionComponent(path, name) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(
    new RegExp(`export function ${name}\\(([^)]+)\\) \\{`),
    `export const ${name} = React.memo(function ${name}($1) {`
  );
  content = content.replace(
    /}\s*$/,
    '});\n'
  );
  fs.writeFileSync(path, content, 'utf8');
  console.log(`Patched ${name}`);
}

patchFunctionComponent('components/community/AuthorTag.tsx', 'AuthorTag');
patchArrowComponent('components/society/TicketCard.tsx', 'TicketCard');
patchArrowComponent('components/society/TransactionCard.tsx', 'TransactionCard');
patchArrowComponent('components/society/CommentItem.tsx', 'CommentItem');

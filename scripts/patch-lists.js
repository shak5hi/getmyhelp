const fs = require('fs');

// VISITOR HISTORY PATCH
let visitorFile = fs.readFileSync('app/visitor/visitor-history.tsx', 'utf8');

if (!visitorFile.includes('ErrorState')) {
  visitorFile = visitorFile.replace(
    'import { StatusPill, visitorStatusTone } from "../../components/ui/StatusPill";',
    'import { StatusPill, visitorStatusTone } from "../../components/ui/StatusPill";\nimport { ErrorState } from "../../components/ui/ErrorState";'
  );
}

if (!visitorFile.includes('const [error, setError]')) {
  visitorFile = visitorFile.replace(
    'const [skip, setSkip] = useState(0);',
    'const [skip, setSkip] = useState(0);\n  const [error, setError] = useState(false);'
  );
}

visitorFile = visitorFile.replace(
  'if (reset) setLoading(true);\n    else setLoadingMore(true);\n    try {',
  'if (reset) setLoading(true);\n    else setLoadingMore(true);\n    setError(false);\n    try {'
);

visitorFile = visitorFile.replace(
  'setHasMore(currentSkip + items.length < total);\n    } finally {',
  'setHasMore(currentSkip + items.length < total);\n    } catch (err) {\n      console.error("visitor history:", err);\n      if (reset) setError(true);\n    } finally {'
);

visitorFile = visitorFile.replace(
  'onEndReached={() => { if (hasMore && !loadingMore) load(); }}',
  'onEndReached={() => { if (hasMore && !loadingMore && !error) load(); }}'
);
visitorFile = visitorFile.replace(
  'ListEmptyComponent={<Text style={styles.empty}>No visitors yet</Text>}',
  'ListEmptyComponent={error ? <ErrorState onRetry={() => load(true)} /> : <Text style={styles.empty}>No visitors yet</Text>}'
);

fs.writeFileSync('app/visitor/visitor-history.tsx', visitorFile, 'utf8');

// FORUM THREAD PATCH
let forumFile = fs.readFileSync('app/community/forum-thread.tsx', 'utf8');

if (!forumFile.includes('ErrorState')) {
  forumFile = forumFile.replace(
    'import { ImageGallery } from "../../components/community/ImageGallery";',
    'import { ImageGallery } from "../../components/community/ImageGallery";\nimport { ErrorState } from "../../components/ui/ErrorState";'
  );
}

if (!forumFile.includes('const [error, setError]')) {
  forumFile = forumFile.replace(
    'const [loading, setLoading] = useState(true);',
    'const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(false);'
  );
}

forumFile = forumFile.replace(
  'setLoading(true);\n    try {',
  'setLoading(true);\n    setError(false);\n    try {'
);

forumFile = forumFile.replace(
  'console.error("forum thread:", e);\n    } finally {',
  'console.error("forum thread:", e);\n      setError(true);\n    } finally {'
);

forumFile = forumFile.replace(
  'ListEmptyComponent={\n            <Text\n              style={{ textAlign: "center", color: "#9CA3AF", padding: 24, fontSize: 14 }}\n            >\n              No replies yet. Be the first!\n            </Text>\n          }',
  'ListEmptyComponent={ error ? <ErrorState onRetry={() => load()} /> : <Text style={{ textAlign: "center", color: "#9CA3AF", padding: 24, fontSize: 14 }}>No replies yet. Be the first!</Text> }'
);

fs.writeFileSync('app/community/forum-thread.tsx', forumFile, 'utf8');

console.log("Patched successfully");

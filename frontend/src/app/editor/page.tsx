import Editor from '@/components/Editor';

export const metadata = {
  title: 'Resume Editor | CV Modernizer',
  description: 'Build and edit your resume without logins or subscriptions.',
};

export default function EditorPage() {
  return (
    <main>
      <Editor />
    </main>
  );
}

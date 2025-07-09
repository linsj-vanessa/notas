import MigrationWizard from '@/components/file-system/MigrationWizard';

export default function MigrationPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Migração para Sistema de Arquivos Local</h1>
          <p className="text-gray-600">
            Migre suas notas do IndexedDB para arquivos locais no seu sistema, 
            permitindo acesso com editores externos como Obsidian.
          </p>
        </div>
        
        <MigrationWizard />
      </div>
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Calendar, Tag, FileText, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Note } from '@/types/note';
import { useNotesStore } from '@/lib/stores';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResults: (results: Note[]) => void;
}

interface SearchFilters {
  query: string;
  tags: string[];
  dateFrom: string;
  dateTo: string;
  contentType: 'all' | 'title' | 'content' | 'both';
  sortBy: 'relevance' | 'created' | 'updated' | 'title';
  sortOrder: 'asc' | 'desc';
  includeDeleted: boolean;
}

export default function AdvancedSearchModal({ isOpen, onClose, onResults }: AdvancedSearchModalProps) {
  const { notes } = useNotesStore();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    dateFrom: '',
    dateTo: '',
    contentType: 'both',
    sortBy: 'relevance',
    sortOrder: 'desc',
    includeDeleted: false,
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [results, setResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Extrair todas as tags disponíveis
      const allTags = new Set<string>();
      notes.forEach(note => {
        note.tags?.forEach(tag => allTags.add(tag));
      });
      setAvailableTags(Array.from(allTags).sort());
    }
  }, [isOpen, notes]);

  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      // Aplicar filtros
      let filteredNotes = notes.filter(note => {
        // Filtro de exclusão/inclusão de deletadas
        if (!filters.includeDeleted && note.isDeleted) return false;
        if (filters.includeDeleted && !note.isDeleted) return false;

        // Filtro de data
        if (filters.dateFrom) {
          const noteDate = new Date(note.createdAt);
          const fromDate = new Date(filters.dateFrom);
          if (noteDate < fromDate) return false;
        }
        
        if (filters.dateTo) {
          const noteDate = new Date(note.createdAt);
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999); // Incluir o dia todo
          if (noteDate > toDate) return false;
        }

        // Filtro de tags
        if (filters.tags.length > 0) {
          const noteTags = note.tags || [];
          const hasAllTags = filters.tags.every(tag => noteTags.includes(tag));
          if (!hasAllTags) return false;
        }

        // Filtro de texto
        if (filters.query.trim()) {
          const query = filters.query.toLowerCase();
          const title = note.title.toLowerCase();
          const content = note.content.toLowerCase();

          switch (filters.contentType) {
            case 'title':
              return title.includes(query);
            case 'content':
              return content.includes(query);
            case 'both':
              return title.includes(query) || content.includes(query);
            default:
              return title.includes(query) || content.includes(query);
          }
        }

        return true;
      });

      // Aplicar ordenação
      filteredNotes.sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'created':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'updated':
            comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            break;
          case 'relevance':
          default:
            // Ordenação por relevância (mais simples)
            if (filters.query.trim()) {
              const queryLower = filters.query.toLowerCase();
              const aTitle = a.title.toLowerCase();
              const bTitle = b.title.toLowerCase();
              
              // Priorizar matches no título
              const aTitleMatch = aTitle.includes(queryLower);
              const bTitleMatch = bTitle.includes(queryLower);
              
              if (aTitleMatch && !bTitleMatch) return -1;
              if (!aTitleMatch && bTitleMatch) return 1;
              
              // Se ambos têm match no título, ordenar por posição do match
              if (aTitleMatch && bTitleMatch) {
                const aIndex = aTitle.indexOf(queryLower);
                const bIndex = bTitle.indexOf(queryLower);
                comparison = aIndex - bIndex;
              }
            } else {
              // Se não há query, ordenar por data de atualização
              comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }
            break;
        }

        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });

      setResults(filteredNotes);
      onResults(filteredNotes);
      
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      tags: [],
      dateFrom: '',
      dateTo: '',
      contentType: 'both',
      sortBy: 'relevance',
      sortOrder: 'desc',
      includeDeleted: false,
    });
    setResults([]);
    onResults([]);
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Busca Avançada
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="p-6 space-y-6">
          {/* Busca por texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="h-4 w-4 inline mr-2" />
              Buscar por texto
            </label>
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              placeholder="Digite sua busca..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            
            {/* Tipo de conteúdo */}
            <div className="mt-2 flex gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Buscar em:</span>
              {[
                { value: 'both', label: 'Título e conteúdo' },
                { value: 'title', label: 'Apenas título' },
                { value: 'content', label: 'Apenas conteúdo' },
              ].map((option) => (
                <label key={option.value} className="flex items-center text-sm">
                  <input
                    type="radio"
                    name="contentType"
                    value={option.value}
                    checked={filters.contentType === option.value}
                    onChange={(e) => setFilters(prev => ({ ...prev, contentType: e.target.value as any }))}
                    className="mr-1"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Filtro por tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="h-4 w-4 inline mr-2" />
              Filtrar por tags
            </label>
            
            {/* Tags selecionadas */}
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {filters.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tags disponíveis */}
            {availableTags.length > 0 && (
              <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2">
                <div className="flex flex-wrap gap-1">
                  {availableTags
                    .filter(tag => !filters.tags.includes(tag))
                    .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filtro por data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Filtrar por data de criação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">De:</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Até:</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Ordenação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter className="h-4 w-4 inline mr-2" />
              Ordenação
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="relevance">Relevância</option>
                <option value="created">Data de criação</option>
                <option value="updated">Última atualização</option>
                <option value="title">Título</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="desc">Decrescente</option>
                <option value="asc">Crescente</option>
              </select>
            </div>
          </div>

          {/* Opções adicionais */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.includeDeleted}
                onChange={(e) => setFilters(prev => ({ ...prev, includeDeleted: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Incluir notas deletadas
              </span>
            </label>
          </div>

          {/* Resultado da busca */}
          {results.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Resultados da busca: {results.length} nota(s) encontrada(s)
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {results.slice(0, 5).map((note) => (
                  <div key={note.id} className="text-sm text-gray-600 dark:text-gray-400">
                    • {note.title || 'Sem título'} 
                    <span className="text-xs ml-2">
                      ({new Date(note.createdAt).toLocaleDateString('pt-BR')})
                    </span>
                  </div>
                ))}
                {results.length > 5 && (
                  <div className="text-xs text-gray-500">
                    ... e mais {results.length - 5} resultado(s)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Limpar Filtros
            </button>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Buscar
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 
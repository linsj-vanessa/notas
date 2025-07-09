'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Note } from '@/types/note';
import { useNotesStore, useUIStore } from '@/lib/stores';

// ✅ Lazy loading do AdvancedSearchModal - carregamento sob demanda
const AdvancedSearchModal = React.lazy(() => import('./advanced-search-modal'));

interface EnhancedSearchBarProps {
  onSearchResults?: (results: Note[]) => void;
  placeholder?: string;
  className?: string;
}

export default function EnhancedSearchBar({ 
  onSearchResults, 
  placeholder = "Buscar notas...",
  className = ""
}: EnhancedSearchBarProps) {
  const { notes } = useNotesStore();
  const { searchTerm, setSearchTerm } = useUIStore();
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [quickResults, setQuickResults] = useState<Note[]>([]);
  const [showQuickResults, setShowQuickResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Busca rápida em tempo real
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = notes.filter(note => 
        !note.isDeleted && (
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ).slice(0, 8); // Limitar a 8 resultados para dropdown
      
      setQuickResults(filtered);
      setShowQuickResults(true);
    } else {
      setQuickResults([]);
      setShowQuickResults(false);
    }
    setSelectedIndex(-1);
  }, [searchTerm, notes]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowQuickResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showQuickResults || quickResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < quickResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < quickResults.length) {
          selectNote(quickResults[selectedIndex]);
        } else if (searchTerm.trim()) {
          // Enter sem seleção - fazer busca completa
          performFullSearch();
        }
        break;
      case 'Escape':
        setShowQuickResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectNote = (note: Note) => {
    setShowQuickResults(false);
    setSearchTerm(note.title);
    // Notificar que uma nota foi selecionada
    if (onSearchResults) {
      onSearchResults([note]);
    }
  };

  const performFullSearch = () => {
    if (searchTerm.trim()) {
      const filtered = notes.filter(note => 
        !note.isDeleted && (
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      
      if (onSearchResults) {
        onSearchResults(filtered);
      }
      setShowQuickResults(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowQuickResults(false);
    if (onSearchResults) {
      onSearchResults([]);
    }
  };

  const handleAdvancedSearchResults = (results: Note[]) => {
    setIsAdvancedSearchOpen(false);
    if (onSearchResults) {
      onSearchResults(results);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">{part}</mark> : 
        part
    );
  };

  const truncateText = (text: string, length: number = 100) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (quickResults.length > 0) {
                setShowQuickResults(true);
              }
            }}
            placeholder={placeholder}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>

        {/* Botão de busca avançada */}
        <button
          onClick={() => setIsAdvancedSearchOpen(true)}
          className="ml-2 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Busca avançada"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Dropdown de resultados rápidos */}
      {showQuickResults && quickResults.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          <div className="p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
              {quickResults.length} resultado(s) encontrado(s)
            </div>
            
            {quickResults.map((note, index) => (
              <button
                key={note.id}
                onClick={() => selectNote(note)}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {highlightMatch(note.title || 'Sem título', searchTerm)}
                    </div>
                    {note.content && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {highlightMatch(truncateText(note.content), searchTerm)}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1">
                          {note.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{note.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            
            {searchTerm.trim() && (
              <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                <button
                  onClick={performFullSearch}
                  className="w-full text-left p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                >
                  Ver todos os resultados para "{searchTerm}"
                </button>
                <button
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  className="w-full text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Busca avançada...
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de busca avançada */}
      {isAdvancedSearchOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando busca avançada...</span>
              </div>
            </div>
          </div>
        }>
          <AdvancedSearchModal
            isOpen={isAdvancedSearchOpen}
            onClose={() => setIsAdvancedSearchOpen(false)}
            onResults={handleAdvancedSearchResults}
          />
        </Suspense>
      )}
    </div>
  );
} 
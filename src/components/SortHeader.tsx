'use client';

export type SortField = 'created_at' | 'nom' | 'status' | 'specialite_souhaitee';
export type SortOrder = 'asc' | 'desc';

interface SortButtonProps {
  label: string;
  field: SortField;
  currentField: SortField;
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export function SortButton({ label, field, currentField, currentOrder, onSort }: SortButtonProps) {
  const isActive = currentField === field;
  
  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
        isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'
      }`}
    >
      <span>{label}</span>
      {isActive && (
        <svg
          className={`w-4 h-4 transition-transform ${currentOrder === 'desc' ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      )}
      {!isActive && (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      )}
    </button>
  );
}

interface SortHeaderProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  totalResults: number;
}

export default function SortHeader({ sortField, sortOrder, onSort, totalResults }: SortHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        <span className="font-medium">
          {totalResults} {totalResults > 1 ? 'résultats' : 'résultat'}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <span className="text-sm text-gray-600 font-medium">Trier par:</span>
        <SortButton
          label="Date"
          field="created_at"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={onSort}
        />
        <SortButton
          label="Nom"
          field="nom"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={onSort}
        />
        <SortButton
          label="Statut"
          field="status"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={onSort}
        />
        <SortButton
          label="Spécialité"
          field="specialite_souhaitee"
          currentField={sortField}
          currentOrder={sortOrder}
          onSort={onSort}
        />
      </div>
    </div>
  );
}

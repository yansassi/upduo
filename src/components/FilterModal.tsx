import React from 'react';
import { X, Filter, RotateCcw, Crown, Save, AlertCircle } from 'lucide-react';

export interface FilterCriteria {
  minAge: number;
  maxAge: number;
  selectedRanks: string[];
  selectedStates: string[];
  selectedCities: string[];
  selectedLanes: string[];
  selectedHeroes: string[];
  compatibilityMode: boolean;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterCriteria;
  onFiltersChange: (filters: FilterCriteria) => void;
  onApplyFilters: () => void;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  isPremium: boolean;
  onGoToPremium?: () => void;
  ranks: Array<{ id: string; name: string; color?: string }>;
  locations: Array<{ id: string; name: string; state_abbr: string; region: string }>;
  lanes: Array<{ id: string; name: string; color?: string }>;
  heroes: Array<{ id: string; name: string; role?: string }>;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  hasUnsavedChanges = false,
  isSaving = false,
  isPremium,
  onGoToPremium,
  ranks,
  locations,
  lanes,
  heroes
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        'Você tem alterações não salvas. Deseja realmente fechar sem salvar?'
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  const updateFilters = (updates: Partial<FilterCriteria>) => {
    const newFilters = { ...filters, ...updates };
    console.log('FilterModal: Updating filters:', updates, 'New filters:', newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    onFiltersChange({
      minAge: 18,
      maxAge: 35,
      selectedRanks: [],
      selectedStates: [],
      selectedCities: [],
      selectedLanes: [],
      selectedHeroes: [],
      compatibilityMode: true
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.minAge !== 18 || filters.maxAge !== 35) count++;
    if (filters.selectedRanks?.length > 0) count++;
    if (filters.selectedStates?.length > 0) count++;
    if (filters.selectedCities?.length > 0) count++;
    if (filters.selectedLanes?.length > 0) count++;
    if (filters.selectedHeroes?.length > 0) count++;
    if (filters.compatibilityMode === false) count++;
    return count;
  };

  const states = [...new Set(locations.map(loc => loc.state_abbr))];
  const citiesInSelectedStates = locations.filter(loc => 
    (filters.selectedStates || []).length === 0 || (filters.selectedStates || []).includes(loc.state_abbr)
  );

  const PremiumUpsell = () => (
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Crown className="w-5 h-5 text-yellow-600" />
        <h3 className="font-semibold text-yellow-800">Filtros Premium</h3>
      </div>
      <p className="text-sm text-yellow-700 mb-3">
        Desbloqueie filtros avançados e algoritmo de compatibilidade inteligente para encontrar matches perfeitos!
      </p>
      <div className="text-sm text-yellow-700 mb-3">
        <strong>Benefícios Premium:</strong> 50 swipes por dia, filtros avançados, ver quem te curtiu, badge verificado e muito mais!
      </div>
      <button 
        onClick={() => {
          if (onGoToPremium) {
            onClose()
            onGoToPremium()
          }
        }}
        className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
      >
        Upgrade para Premium
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Filtros Avançados</h2>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                {getActiveFiltersCount()} ativo{getActiveFiltersCount() > 1 ? 's' : ''}
              </span>
            )}
            {hasUnsavedChanges && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Não salvo
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!isPremium && <PremiumUpsell />}

          {/* Age Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Faixa Etária: {filters.minAge} - {filters.maxAge} anos
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="18"
                  max="50"
                  value={filters.minAge}
                  onChange={(e) => updateFilters({ minAge: parseInt(e.target.value) })}
                  disabled={!isPremium}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>18</span>
                  <span>50</span>
                </div>
              </div>
              <span className="text-gray-400">até</span>
              <div className="flex-1">
                <input
                  type="range"
                  min="18"
                  max="50"
                  value={filters.maxAge}
                  onChange={(e) => updateFilters({ maxAge: parseInt(e.target.value) })}
                  disabled={!isPremium}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>18</span>
                  <span>50</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ranks */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Elo/Rank</label>
            <div className="grid grid-cols-2 gap-2">
              {ranks.map((rank) => (
                <button
                  key={rank.id}
                  onClick={() => {
                    if (!isPremium) return;
                    const currentRanks = filters.selectedRanks || [];
                    const newRanks = currentRanks.includes(rank.id)
                      ? currentRanks.filter(r => r !== rank.id)
                      : [...currentRanks, rank.id];
                    console.log('FilterModal: Rank selection changed:', { rank: rank.id, newRanks });
                    updateFilters({ selectedRanks: newRanks });
                  }}
                  disabled={!isPremium}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${
                    filters.selectedRanks?.includes(rank.id)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {rank.name}
                </button>
              ))}
            </div>
          </div>

          {/* States */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Estados</label>
            <div className="grid grid-cols-4 gap-2">
              {states.map((state) => (
                <button
                  key={state}
                  onClick={() => {
                    if (!isPremium) return;
                    const currentStates = filters.selectedStates || [];
                    const newStates = currentStates.includes(state)
                      ? currentStates.filter(s => s !== state)
                      : [...currentStates, state];
                    console.log('FilterModal: State selection changed:', { state, newStates });
                    updateFilters({ selectedStates: newStates, selectedCities: [] });
                  }}
                  disabled={!isPremium}
                  className={`p-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${
                    filters.selectedStates?.includes(state)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          {/* Cities */}
          {filters.selectedStates && filters.selectedStates.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Cidades</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto touch-pan-y">
                {citiesInSelectedStates.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => {
                      if (!isPremium) return;
                      const currentCities = filters.selectedCities || [];
                      const newCities = currentCities.includes(location.name)
                        ? currentCities.filter(c => c !== location.name)
                        : [...currentCities, location.name];
                      console.log('FilterModal: City selection changed:', { city: location.name, newCities });
                      updateFilters({ selectedCities: newCities });
                    }}
                    disabled={!isPremium}
                    className={`p-2 rounded-lg border text-sm transition-colors disabled:opacity-50 ${
                      filters.selectedCities?.includes(location.name)
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {location.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lanes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Linhas Favoritas</label>
            <div className="grid grid-cols-2 gap-2">
              {lanes.map((lane) => (
                <button
                  key={lane.id}
                  onClick={() => {
                    if (!isPremium) return;
                    const currentLanes = filters.selectedLanes || [];
                    const newLanes = currentLanes.includes(lane.id)
                      ? currentLanes.filter(l => l !== lane.id)
                      : [...currentLanes, lane.id];
                    console.log('FilterModal: Lane selection changed:', { lane: lane.id, newLanes });
                    updateFilters({ selectedLanes: newLanes });
                  }}
                  disabled={!isPremium}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${
                    filters.selectedLanes?.includes(lane.id)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {lane.name}
                </button>
              ))}
            </div>
          </div>

          {/* Heroes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Heróis Favoritos</label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto touch-pan-y">
              {heroes.slice(0, 20).map((hero) => (
                <button
                  key={hero.id}
                  onClick={() => {
                    if (!isPremium) return;
                    const currentHeroes = filters.selectedHeroes || [];
                    const newHeroes = currentHeroes.includes(hero.id)
                      ? currentHeroes.filter(h => h !== hero.id)
                      : [...currentHeroes, hero.id];
                    console.log('FilterModal: Hero selection changed:', { hero: hero.id, newHeroes });
                    updateFilters({ selectedHeroes: newHeroes });
                  }}
                  disabled={!isPremium}
                  className={`p-2 rounded-lg border text-xs transition-colors disabled:opacity-50 ${
                    filters.selectedHeroes?.includes(hero.id)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {hero.name}
                </button>
              ))}
            </div>
          </div>

          {/* Compatibility Mode */}
          <div className="mb-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={filters.compatibilityMode}
                onChange={(e) => updateFilters({ compatibilityMode: e.target.checked })}
                disabled={!isPremium}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-sm font-medium text-gray-700">
                Modo Compatibilidade Inteligente
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-7">
              Prioriza perfis com base em sinergia de heróis e linhas complementares
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={resetFilters}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Limpar Filtros
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onApplyFilters();
              }}
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Aplicar Filtros
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="bg-orange-50 border-t border-orange-200 p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Você tem alterações não salvas. Clique em "Aplicar Filtros" para salvar suas preferências.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
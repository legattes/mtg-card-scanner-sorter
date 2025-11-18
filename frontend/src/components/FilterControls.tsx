import { useState } from 'react';
import type { ImageProcessingOptions } from '../utils/imageProcessing';
import './FilterControls.css';

interface FilterControlsProps {
  filters: ImageProcessingOptions;
  onFiltersChange: (filters: ImageProcessingOptions) => void;
}

export type FilterPreset = {
  name: string;
  filters: ImageProcessingOptions;
};

const PRESETS: FilterPreset[] = [
  {
    name: 'Padrão',
    filters: {
      contrast: 1.6,
      brightness: 5,
      gamma: 0.8,
      grayscale: true,
      sharpen: true,
      enhanceContrast: true,
    },
  },
  {
    name: 'Alto Contraste',
    filters: {
      contrast: 2.0,
      brightness: 0,
      gamma: 0.7,
      grayscale: true,
      sharpen: true,
      enhanceContrast: true,
    },
  },
  {
    name: 'Suave',
    filters: {
      contrast: 1.3,
      brightness: 10,
      gamma: 1.0,
      grayscale: true,
      sharpen: false,
      enhanceContrast: false,
    },
  },
];

export const FilterControls = ({ filters, onFiltersChange }: FilterControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const applyPreset = (preset: FilterPreset) => {
    onFiltersChange(preset.filters);
    setSelectedPreset(preset.name);
  };

  const updateFilter = (key: keyof ImageProcessingOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
    setSelectedPreset(null); // Reset preset quando ajustar manualmente
  };

  return (
    <div className="filter-controls">
      <button
        className="filter-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        {isExpanded ? 'Ocultar Filtros' : 'Ajustar Filtros'}
      </button>

      {isExpanded && (
        <div className="filter-panel">
          <div className="presets-section">
            <label>Presets:</label>
            <div className="presets-buttons">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className={`preset-btn ${selectedPreset === preset.name ? 'active' : ''}`}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="sliders-section">
            <div className="slider-group">
              <label>
                Contraste: {filters.contrast?.toFixed(2) || '1.20'}
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={filters.contrast || 1.2}
                  onChange={(e) => updateFilter('contrast', parseFloat(e.target.value))}
                  className="slider"
                />
              </label>
            </div>

            <div className="slider-group">
              <label>
                Brilho: {filters.brightness || '0'}
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={filters.brightness || 0}
                  onChange={(e) => updateFilter('brightness', parseInt(e.target.value))}
                  className="slider"
                />
              </label>
            </div>

            <div className="slider-group">
              <label>
                Gamma: {filters.gamma?.toFixed(2) || '1.00'}
                <input
                  type="range"
                  min="0.3"
                  max="2.0"
                  step="0.1"
                  value={filters.gamma || 1.0}
                  onChange={(e) => updateFilter('gamma', parseFloat(e.target.value))}
                  className="slider"
                />
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.grayscale !== false}
                  onChange={(e) => updateFilter('grayscale', e.target.checked)}
                />
                Escala de Cinza
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.sharpen !== false}
                  onChange={(e) => updateFilter('sharpen', e.target.checked)}
                />
                Nitidez
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.enhanceContrast !== false}
                  onChange={(e) => updateFilter('enhanceContrast', e.target.checked)}
                />
                Realçar Contraste
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


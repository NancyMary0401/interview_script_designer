import React from 'react';
import { motion } from 'framer-motion';
import { Filter, BarChart3, User, Settings2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';

const FilterControls = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  isVisible = true 
}) => {
  const hasActiveFilters = filters.breadth || filters.persona || filters.depth !== null;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card 
        className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-sm"
        role="region"
        aria-label="Question filters"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-purple-600" />
              Filter Questions
            </CardTitle>
            {hasActiveFilters && (
              <Button
                onClick={onClearFilters}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Breadth Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                Breadth
              </label>
              <Select
                value={filters.breadth || ''}
                onValueChange={(value) => onFilterChange('breadth', value || null)}
              >
                <SelectTrigger className="border-gray-200 focus:border-purple-400 focus:ring-purple-400 bg-white">
                  <SelectValue placeholder="All Breadth Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Breadth Levels</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Persona Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2 text-green-600" />
                Persona
              </label>
              <Select
                value={filters.persona || ''}
                onValueChange={(value) => onFilterChange('persona', value || null)}
              >
                <SelectTrigger className="border-gray-200 focus:border-purple-400 focus:ring-purple-400 bg-white">
                  <SelectValue placeholder="All Personas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Personas</SelectItem>
                  <SelectItem value="Evidence-first">Evidence-first</SelectItem>
                  <SelectItem value="Why-How">Why-How</SelectItem>
                  <SelectItem value="Metrics-Driven">Metrics-Driven</SelectItem>
                  <SelectItem value="Storytelling">Storytelling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Depth Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Settings2 className="w-4 h-4 mr-2 text-orange-600" />
                Depth: {filters.depth !== null ? (
                  filters.depth === 0 ? 'None' : 
                  filters.depth === 1 ? 'Low' : 
                  filters.depth === 2 ? 'Medium' : 
                  filters.depth === 3 ? 'High' : 
                  filters.depth
                ) : 'All Levels'}
              </label>
              <div className="space-y-2">
                <Slider
                  min={-1}
                  max={3}
                  step={1}
                  value={[filters.depth !== null ? filters.depth : -1]}
                  onValueChange={(value) => onFilterChange('depth', value[0] === -1 ? null : value[0])}
                  className="flex-1"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>All</span>
                  <span>None</span>
                  <span>Low</span>
                  <span>Med</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-2 pt-2 border-t border-gray-100"
            >
              <span className="text-xs text-gray-600 font-medium">Active filters:</span>
              {filters.breadth && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Breadth: {filters.breadth}
                  <button
                    onClick={() => onFilterChange('breadth', null)}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.persona && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  Persona: {filters.persona}
                  <button
                    onClick={() => onFilterChange('persona', null)}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.depth !== null && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                  Depth: {filters.depth === 0 ? 'None' : 
                           filters.depth === 1 ? 'Low' : 
                           filters.depth === 2 ? 'Medium' : 
                           filters.depth === 3 ? 'High' : 
                           filters.depth}
                  <button
                    onClick={() => onFilterChange('depth', null)}
                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FilterControls;

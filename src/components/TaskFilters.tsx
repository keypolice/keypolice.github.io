import React from 'react';
import { useTasks } from '../store/taskStore';
import { Search, Filter } from 'lucide-react';
import { statusLabels } from './TaskCard';
const CATEGORIES = [
'Дизайн',
'Разработка и IT',
'Тексты и переводы',
'SEO и трафик',
'Соцсети и маркетинг',
'Аудио, видео, съемка',
'Бизнес и жизнь'];

const BUDGET_RANGES = [
{
  label: 'До 1 000 ₽',
  value: '0-1000'
},
{
  label: 'От 1 000 ₽ до 3 000 ₽',
  value: '1000-3000'
},
{
  label: 'От 3 000 ₽ до 10 000 ₽',
  value: '3000-10000'
},
{
  label: 'От 10 000 ₽',
  value: '10000-plus'
}];

export const TaskFilters = () => {
  const { filters, setFilters } = useTasks();
  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category) ?
      prev.categories.filter((c) => c !== category) :
      [...prev.categories, category]
    }));
  };
  const handleBudgetChange = (range: string) => {
    setFilters((prev) => ({
      ...prev,
      budgetRanges: prev.budgetRanges.includes(range) ?
      prev.budgetRanges.filter((r) => r !== range) :
      [...prev.budgetRanges, range]
    }));
  };
  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status) ?
      prev.status.filter((s) => s !== status) :
      [...prev.status, status]
    }));
  };
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск проектов..."
            value={filters.search}
            onChange={(e) =>
            setFilters({
              ...filters,
              search: e.target.value
            })
            }
            className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary" />
          
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center text-sm">
          <Filter className="w-4 h-4 mr-2" />
          Рубрики
        </h4>
        <div className="space-y-2">
          {CATEGORIES.map((category) =>
          <label
            key={category}
            className="flex items-center space-x-2 cursor-pointer group">
            
              <input
              type="checkbox"
              checked={filters.categories.includes(category)}
              onChange={() => handleCategoryChange(category)}
              className="rounded border-input text-primary focus:ring-primary w-4 h-4" />
            
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {category}
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Budget */}
      <div>
        <h4 className="font-semibold mb-3 text-sm">Бюджет</h4>
        <div className="space-y-2">
          {BUDGET_RANGES.map((range) =>
          <label
            key={range.value}
            className="flex items-center space-x-2 cursor-pointer group">
            
              <input
              type="checkbox"
              checked={filters.budgetRanges.includes(range.value)}
              onChange={() => handleBudgetChange(range.value)}
              className="rounded border-input text-primary focus:ring-primary w-4 h-4" />
            
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {range.label}
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <h4 className="font-semibold mb-3 text-sm">Статус</h4>
        <div className="space-y-2">
          {Object.entries(statusLabels).map(([value, label]) =>
          <label
            key={value}
            className="flex items-center space-x-2 cursor-pointer group">
            
              <input
              type="checkbox"
              checked={filters.status.includes(value)}
              onChange={() => handleStatusChange(value)}
              className="rounded border-input text-primary focus:ring-primary w-4 h-4" />
            
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {label}
              </span>
            </label>
          )}
        </div>
      </div>
    </div>);

};
'use client';

import React, { useState, useEffect } from "react";
import { knowledgeAPI } from "../../lib/supabase";
import SidebarNavigation from "../../components/SidebarNavigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Individual knowledge item card within a subcategory
const KnowledgeItemCard = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMasteryExpanded, setIsMasteryExpanded] = useState(false);
  const truncateLength = 150;
  const shouldTruncate = item.content.length > truncateLength;

  // Get mastery level styling
  const getMasteryLevel = (mastery) => {
    if (mastery >= 0.9) return { level: 'Expert', color: 'text-lime-700', bg: 'bg-lime-100' };
    if (mastery >= 0.7) return { level: 'Advanced', color: 'text-lime-600', bg: 'bg-lime-50' };
    if (mastery >= 0.5) return { level: 'Intermediate', color: 'text-lime-600', bg: 'bg-lime-50' };
    if (mastery >= 0.3) return { level: 'Beginner', color: 'text-lime-600', bg: 'bg-lime-50' };
    return { level: 'Novice', color: 'text-lime-600', bg: 'bg-lime-50' };
  };

  return (
    <div className="bg-white rounded-lg border border-lime-100 shadow-sm">
      {/* Subcategory Header */}
      {item.sub_category && (
        <div className="w-full rounded-t-lg bg-lime-600 text-white text-sm font-semibold px-4 py-2 text-center shadow">
          {item.sub_category}
        </div>
      )}
      {/* Card Content */}
      <div className="p-4">
        {/* Content */}
        <div className="mb-3">
          <div className="text-gray-900 text-sm leading-relaxed">
            <ReactMarkdown>
              {shouldTruncate && !isExpanded
                ? `${item.content.substring(0, truncateLength)}...`
                : item.content}
            </ReactMarkdown>
          </div>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-lime-700 hover:text-lime-900 text-xs font-medium transition-colors cursor-pointer"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>

        {/* Mastery Level */}
        {item.mastery !== undefined && item.mastery !== null && (
          <div className="mb-3 p-2 rounded-lg bg-lime-50 border border-lime-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-lime-600">Mastery Level</p>
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${getMasteryLevel(item.mastery).color}`}>
                    {getMasteryLevel(item.mastery).level}
                  </span>
                  <span className={`text-sm font-medium ${getMasteryLevel(item.mastery).color} ml-1`}>
                    ({item.mastery !== null ? Math.round(item.mastery * 100) : 'N/A'}%)
                  </span>
                </div>
              </div>
              {item.mastery_explanation && (
                <button
                  onClick={() => setIsMasteryExpanded(!isMasteryExpanded)}
                  className="h-8 w-8 flex items-center justify-center text-lime-700 hover:text-lime-900 transition-colors cursor-pointer"
                >
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${isMasteryExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
            </div>
            {item.mastery_explanation && isMasteryExpanded && (
              <p className="text-xs text-lime-700 mt-2 pt-2 border-t border-lime-100">
                {item.mastery_explanation}
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-lime-100 text-lime-800 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-xs text-gray-500 border-t border-lime-100 pt-2">
          Last updated: {new Date(item.last_updated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>
    </div>
  );
};

// Main category card component
const MainCategoryCard = ({ mainCategory, data, isExpanded, onToggle }) => {
  // Group items by subcategory
  const groupedBySubCategory = data.reduce((acc, item) => {
    const subCat = item.sub_category;
    if (!acc[subCat]) {
      acc[subCat] = [];
    }
    acc[subCat].push(item);
    return acc;
  }, {});

  const totalItems = data.length;
  const subCategoryCount = Object.keys(groupedBySubCategory).length;

  return (
    <div
      className={`rounded-xl shadow-lg overflow-hidden bg-white border border-lime-100 transition-all duration-300 ${
        isExpanded ? "col-span-full" : ""
      }`}
    >
      {/* Card Header - Always Visible */}
      <div
        className="p-6 cursor-pointer hover:bg-lime-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {mainCategory}
            </h2>
            <div className="flex items-center gap-4 text-lime-700 text-sm">
              <span>{totalItems} items</span>
              <span>•</span>
              <span>{subCategoryCount} categories</span>
            </div>

            {/* Sample subcategories when collapsed */}
            {!isExpanded && (
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.keys(groupedBySubCategory)
                  .slice(0, 3)
                  .map((subCat) => (
                    <span
                      key={subCat}
                      className="bg-lime-100 text-lime-800 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {subCat}
                    </span>
                  ))}
                {subCategoryCount > 3 && (
                  <span className="bg-lime-100 text-lime-800 px-3 py-1 rounded-full text-xs font-medium">
                    +{subCategoryCount - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="ml-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lime-100 text-lime-700">
              {isExpanded ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 w-full">
          <div className="bg-black/10 rounded-lg px-4 py-6 w-full">
            <div className="grid grid-cols-2 gap-4 w-full">
              {data.map((item) => (
                <KnowledgeItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function OrganizedKnowledgeView({ searchParams }) {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState(searchParams?.q || "");

  // Fetch knowledge items
  useEffect(() => {
    async function fetchKnowledgeItems() {
      try {
        setLoading(true);
        setError(null);

        const [data, statsData] = await Promise.all([
          knowledgeAPI.getAll(),
          knowledgeAPI.getStats(),
        ]);

        setKnowledgeItems(data || []);
        setStats(statsData);
      } catch (err) {
        console.error("❌ Error fetching knowledge items:", err);
        setError(`Failed to load knowledge items: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchKnowledgeItems();
  }, []);

  // Group items by main category
  const groupedByMainCategory = knowledgeItems.reduce((acc, item) => {
    const mainCat = item.main_category;
    if (!acc[mainCat]) {
      acc[mainCat] = [];
    }
    acc[mainCat].push(item);
    return acc;
  }, {});

  // Filter items based on search
  const filteredGroupedData = Object.entries(groupedByMainCategory).reduce(
    (acc, [mainCat, items]) => {
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        const filteredItems = items.filter(
          (item) =>
            item.content.toLowerCase().includes(search) ||
            item.sub_category.toLowerCase().includes(search) ||
            mainCat.toLowerCase().includes(search) ||
            (item.tags &&
              item.tags.some((tag) => tag.toLowerCase().includes(search)))
        );
        if (filteredItems.length > 0) {
          acc[mainCat] = filteredItems;
        }
      } else {
        acc[mainCat] = items;
      }
      return acc;
    },
    {}
  );

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    setExpandedCategories(new Set(Object.keys(filteredGroupedData)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-white via-lime-50 to-green-100">
        <SidebarNavigation currentPage="knowledge" stats={stats} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mb-4 mx-auto"></div>
            <p className="text-gray-600">Loading your knowledge database...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-white via-lime-50 to-green-100">
        <SidebarNavigation currentPage="knowledge" stats={stats} />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-red-800 font-medium mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-lime-50 to-green-100">
      <SidebarNavigation currentPage="knowledge" stats={stats} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Knowledge Database
            </h1>
            <p className="text-gray-700 text-lg">
              Organized view of your {knowledgeItems.length} knowledge items
              across {Object.keys(groupedByMainCategory).length} categories
            </p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search across all categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-lime-200 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
              />
              <div className="absolute left-3 top-3 text-lime-500">🔍</div>
            </div>

            {/* Expand/Collapse Controls */}
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors text-sm font-medium shadow"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          {Object.keys(filteredGroupedData).length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(filteredGroupedData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([mainCategory, items]) => (
                  <MainCategoryCard
                    key={mainCategory}
                    mainCategory={mainCategory}
                    data={items}
                    isExpanded={expandedCategories.has(mainCategory)}
                    onToggle={() => toggleCategory(mainCategory)}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-lime-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                {searchTerm
                  ? "No matching items found"
                  : "No knowledge items found"}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search terms or clear the search to see all items."
                  : "Start adding knowledge items to see them organized here."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-3 bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
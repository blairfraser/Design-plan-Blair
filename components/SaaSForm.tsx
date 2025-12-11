import React, { useState } from 'react';

interface SaaSFormProps {
  onSubmit: () => void;
  onInteraction?: () => void;
}

const SaaSForm: React.FC<SaaSFormProps> = ({ onSubmit, onInteraction }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Critical: Trigger audio unlock immediately on user interaction
    if (onInteraction) {
      onInteraction();
    }

    setIsSubmitting(true);
    // Simulate a brief network request/processing delay before the surprise
    setTimeout(() => {
      onSubmit();
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold">AI</span>
            Design Planner
          </h2>
          <p className="text-slate-500 text-sm mt-1">New Project Setup</p>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Project Name
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Q4 Marketing Redesign" 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">UX Design</span>
              <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-medium border border-slate-100">Mobile</span>
              <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-medium border border-slate-100">Web</span>
            </div>
            <input 
              type="text" 
              placeholder="Add more tags..." 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 text-sm"
            />
          </div>

          {/* Goal Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              What type of help do you need?
            </label>
            <div className="space-y-3">
              <label className="flex items-start p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <input name="goal" type="radio" className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                <span className="ml-3 text-sm text-slate-600">Generate high-fidelity mockups based on existing wireframes</span>
              </label>
              
              <label className="flex items-start p-3 border border-blue-200 bg-blue-50/30 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                <input name="goal" type="radio" defaultChecked className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                <span className="ml-3 text-sm text-slate-800 font-medium">Help me plan our design approach together as a team</span>
              </label>

              <label className="flex items-start p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <input name="goal" type="radio" className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                <span className="ml-3 text-sm text-slate-600">Audit existing design system for accessibility compliance</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100 mt-6">
            <button type="button" className="text-sm text-slate-500 hover:text-slate-800 font-medium px-4 py-2">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`
                bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2
                ${isSubmitting ? 'opacity-80 cursor-wait' : ''}
              `}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Plan...
                </>
              ) : (
                'Create Design Plan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaaSForm;
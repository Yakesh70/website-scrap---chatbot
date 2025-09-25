export default function ScrapedLinks({ link, onDelete }) {
  const linkCount = link.anchorCount || link.anchorTags?.length || 0;
  const domain = new URL(link.originalUrl).hostname;
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this website and all its data?')) {
      onDelete(link._id);
    }
  };
  
  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-800 text-lg truncate">{domain}</h3>
          </div>
          
          <a 
            href={link.originalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-purple-600 transition-colors duration-200 truncate block"
          >
            {link.originalUrl}
          </a>
        </div>
        
        <div className="ml-4 flex items-center space-x-2">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
            {linkCount} links
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete website"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Links Preview */}
      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        {link.anchorTags?.length > 0 ? (
          link.anchorTags.slice(0, 5).map((tag, index) => (
            <div key={index} className="group/link flex items-start space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors duration-200">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <a 
                  href={tag.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors duration-200 line-clamp-1"
                >
                  {tag.text || 'Untitled Link'}
                </a>
                <p className="text-xs text-gray-400 truncate mt-1">{tag.url}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="text-gray-400 text-sm">No links found</p>
          </div>
        )}
        
        {link.anchorTags?.length > 5 && (
          <div className="text-center pt-2">
            <span className="text-xs text-gray-500">
              +{link.anchorTags.length - 5} more links
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
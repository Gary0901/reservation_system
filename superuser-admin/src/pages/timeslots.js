import React, { useState } from 'react';

function TemplatePage() {
  const [templates] = useState([
    { id: 1, name: '一般診所時段', description: '週一至週五 9:00-17:00', isActive: true },
    { id: 2, name: '週末特別門診', description: '週六 10:00-15:00', isActive: true },
    { id: 3, name: '夜間診所', description: '週一至週五 18:00-21:00', isActive: false },
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">模板設定</h2>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            新增模板
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{template.name}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.isActive ? '使用中' : '未使用'}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{template.description}</p>
              <div className="mt-4 flex justify-end space-x-2">
                <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded">編輯</button>
                <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TemplatePage;
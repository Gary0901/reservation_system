import React, { useState, useEffect } from 'react';

function TemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [daysToGenerate, setDaysToGenerate] = useState(14);
  const [generationSuccess, setGenerationSuccess] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  
  const baseUrl = 'https://liff-reservation.zeabur.app';
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/time-slots?date=&isTemplate=true`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setTemplates(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Function to format time (e.g., "00:00" instead of "00:00:00")
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  // Group templates by court ID
  const groupTemplatesByCourt = () => {
    const courtGroups = {};
    
    templates.forEach(template => {
      if (template.courtId) {
        const courtId = template.courtId._id;
        if (!courtGroups[courtId]) {
          courtGroups[courtId] = {
            court: template.courtId,
            templates: []
          };
        }
        courtGroups[courtId].templates.push(template);
      }
    });
    
    return Object.values(courtGroups);
  };
  
  // Function to generate time slots from templates
  const generateTimeSlots = async () => {
    if (!startDate) {
      alert('請選擇開始日期');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationSuccess(null);
      
      const response = await fetch(`${baseUrl}/api/time-slots/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate,
          daysToGenerate: daysToGenerate
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Store the response data in state
      const result = await response.json();
      setGenerationResult(result);
      setGenerationSuccess(true);
    } catch (err) {
      console.error("Error generating time slots:", err);
      setGenerationSuccess(false);
      setGenerationResult(null);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const courtGroups = groupTemplatesByCourt();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">模板設定</h2>
          
          {/* Generate Time Slots Section */}
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">使用模板生成時間段</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生成天數</label>
                <input
                  type="number"
                  value={daysToGenerate}
                  onChange={(e) => setDaysToGenerate(Number(e.target.value))}
                  min="1"
                  max="365"
                  className="p-2 border rounded-md w-24"
                />
              </div>
              <button
                onClick={generateTimeSlots}
                disabled={isGenerating}
                className={`px-4 py-2 text-white rounded-md ${isGenerating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isGenerating ? '生成中...' : '生成時間段'}
              </button>
              
              {generationSuccess === true && (
                <span className="text-green-600">時間段生成成功！</span>
              )}
              {generationSuccess === false && (
                <span className="text-red-600">時間段生成失敗，請稍後再試。</span>
              )}
            </div>
            
            {/* Generation Result Display */}
            {generationResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <h4 className="font-medium mb-2">生成結果:</h4>
                <div className="text-sm">
                  <p>訊息: {generationResult.message}</p>
                  <p>生成數量: {generationResult.generatedCount}</p>
                  <p>時段已存在: {generationResult.totalExisting}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p>載入中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>發生錯誤: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courtGroups.map(group => (
              <div key={group.court._id} className="space-y-4">
                <div className="text-center bg-gray-100 py-2 rounded-md">
                  <h3 className="font-semibold">{group.court.name}</h3>
                </div>
                
                {group.templates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                    </div>
                    
                    <div className="text-gray-600 mt-2">
                      <p>時間: {formatTime(template.startTime)} - {formatTime(template.endTime)}</p>
                      <p>價格: ${template.defaultPrice}</p>
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-2">
                      <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded">編輯</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplatePage;
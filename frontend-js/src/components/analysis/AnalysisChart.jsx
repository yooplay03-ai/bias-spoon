import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const AnalysisChart = ({ data }) => {
  if (!data || typeof data === 'string' || !Array.isArray(data)) {
    console.log('차트 데이터 대기 중 또는 형식 오류:', data);
    return null;
  }

  // 소수점 데이터를 퍼센트로 변환 (0.852 -> 85.2)
  const chartData = data.map((item) => ({
    name: item.name,
    score: (item.value * 100).toFixed(1),
  }));

  return (
    <div>
      <ResponsiveContainer width="99%" height={350} debounce={1}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis unit="%" domain={[0, 100]} />
          <Tooltip formatter={(value) => [`${value}%`, '수치']} />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              // 점수가 높을수록(예: 편향성이 높을수록) 붉은색 계열로 표시
              <Cell
                key={`cell-${index}`}
                fill={entry.score > 70 ? '#f87171' : '#6366f1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalysisChart;

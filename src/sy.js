            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis 
              type="number"
              domain={[0, 'auto']}
            />
            <YAxis 
              dataKey="name" 
              type="category"
              width={80}
              interval={0} // Show all labels
            />
            <Tooltip />
            {/* Seven stacked bars */}
            <Bar dataKey="cat1" stackId="a" fill={colors[0]} name="Category 1" />
            <Bar dataKey="cat2" stackId="a" fill={colors[1]} name="Category 2" />
            <Bar dataKey="cat3" stackId="a" fill={colors[2]} name="Category 3" />
            <Bar dataKey="cat4" stackId="a" fill={colors[3]} name="Category 4" />
            <Bar dataKey="cat5" stackId="a" fill={colors[4]} name="Category 5" />
            <Bar dataKey="cat6" stackId="a" fill={colors[5]} name="Category 6" />
            <Bar dataKey="cat7" stackId="a" fill={colors[6]} name="Category 7" />
          </BarChart>
          {page * ITEMS_PER_PAGE < data.length - ITEMS_PER_PAGE && (
            <div className="text-center p-4 text-gray-500">
              Scroll to load more...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualizedStackedChart;

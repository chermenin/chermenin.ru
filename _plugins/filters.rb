module Jekyll
  module CustomFilters
    def sort_by_size(input, array_key)
      input.sort_by { |item| -item[array_key].size }
    end
  end
end

Liquid::Template.register_filter(Jekyll::CustomFilters)

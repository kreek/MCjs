require 'rubygems'
require 'sprockets'
require 'yui/compressor'

env = Sprockets::Environment.new
env.prepend_path 'js'
javascripts = [
  {:src => env['build.js'].to_s, :file_path => "mc.min.js"}, 
]

compressor = YUI::JavaScriptCompressor.new(:munge => true)

javascripts.each do |js|
  compressed = compressor.compress(js[:src])
  if File.exists?(js[:file_path])
    FileUtils.rm(js[:file_path])
  end
  File.open(js[:file_path], 'w') {|f| f.write(compressed) }
end



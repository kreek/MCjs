class App < Sinatra::Application
  
  configure do
    set :haml, :format => :html5
    set :root, File.dirname(__FILE__)
  end
  
  get '/' do
    haml :index
  end
  
  get '/observer' do
    haml :observer
  end
  
  get '/di' do
    haml :di
  end
  
  get '/traits' do
    haml :traits
  end
  
  get '/step' do
    haml :step
  end
  
  get "/inline" do
    Haml::Engine.new("%p foo").render
  end
  
  configure do
    set :root, File.dirname(__FILE__)
  end
  
  get "/mustache" do
    Mustache.render("Hello {{planet}}", :planet => "World!")
  end

end
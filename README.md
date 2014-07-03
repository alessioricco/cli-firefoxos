cli-firefoxos
=============

Titanium CLI plugin for firefoxos deployment (adapt a mobileweb build to firefoxos)

Usage:
ti build -p mobileweb --firefoxos
ti build -p mobileweb -D production --firefoxos

in this release:
put your firefox OS manifest inside the tiapp.xml file

    <mobileweb>
    	<firefoxos>
    		<manifest>
    			{
				  "name": "My App",
				  "description": "My elevator pitch goes here",
				  "launch_path": "/index.html",
				  "icons": {
				    "128": "/img/icon-128.png"
				  },
				  "developer": {
				    "name": "Your name or organization",
				    "url": "http://your-homepage-here.org"
				  },
				  "default_locale": "en"
				}
    		</manifest>
    	</firefoxos>
    </mobileweb>

In the next releases it will be created by default if the plugin will not find it in the <mobileweb> section



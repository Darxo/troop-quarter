::Hooks.registerJS("ui/mods/mod_TQUA/mod_Assets.js");

local prefixLen = "ui/mods/".len();
foreach(file in ::IO.enumerateFiles("ui/mods/mod_TQUA/js_hooks"))
{
	::Hooks.registerJS(file + ".js");
}

// New Screens
::Hooks.registerJS("ui/mods/mod_TQUA/roster_manager_screen/roster_container.js");
::Hooks.registerJS("ui/mods/mod_TQUA/roster_manager_screen/roster_manager.js");

::Hooks.registerJS("ui/mods/mod_TQUA/roster_manager_screen/roster_manager_roster_module.js");
::Hooks.registerCSS("ui/mods/mod_TQUA/roster_manager_screen/roster_manager_roster_module.css");

::Hooks.registerJS("ui/mods/mod_TQUA/roster_manager_screen/roster_manager_datasource.js");
::Hooks.registerJS("ui/mods/mod_TQUA/roster_manager_screen/roster_manager_screen.js");

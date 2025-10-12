::modTQUA <- {
	ID = "mod_TQUA",
	Name = "Troop Quarter",
	Version = "0.2.0",
	DefaultLoadOrder = [">mod_msu", ">mod_legends", ">mod_URUI"],
	Const = {
		// Vanilla
		MinPlayerRoster = 1,
		PlayerFormationSize = 18,
		PlayerReserveSize = 9,
	}
	Global = {
		// Vanilla and Modded (non-legends)
		getPlayerReserveSize = function()
		{
			// The vanilla getFormation is one of the rare places, where the amount of slots, representing the player party, is [hard] coded into
			// We assume that if ever a mod changes the amount of reserve slots, they would adjust that vanilla function accordingly
			return ::World.Assets.getFormation().len() - ::modTQUA.Const.PlayerFormationSize;
		}
	}
}

::modTQUA.HooksMod <- ::Hooks.register(::modTQUA.ID, ::modTQUA.Version, ::modTQUA.Name);
::modTQUA.HooksMod.require(["mod_msu"]);

::modTQUA.HooksMod.queue(::modTQUA.DefaultLoadOrder, function()
{
	::modTQUA.Mod <- ::MSU.Class.Mod(::modTQUA.ID, ::modTQUA.Version, ::modTQUA.Name);

	::include("mod_TQUA/load");		// Load mod adjustments and other hooks
	::include("mod_TQUA/ui/load");		// Load JS Adjustments and Hooks

// MSU Keybinds

	::modTQUA.Mod.Tooltips.setTooltips({
		RosterModule = {
			RosterSizeLabel = ::MSU.Class.BasicTooltip("Roster Size", "Shows the current and maximum amount of characters for this roster.")
		}
	});

});

::mods_hookNewObject("ui/screens/world/world_town_screen", function(o)
{
    o.m.TroopQuarter <- ::new("scripts/ui/screens/world/modules/world_town_screen/troop_quarter_dialog_module");
    o.m.TroopQuarter.setParent(o);
    o.m.TroopQuarter.connectUI(o.m.JSHandle);

	o.getTroopQuarterModule <- function()
	{
		return this.m.TroopQuarter;
	}

    local oldDestroy = o.destroy;
    o.destroy = function()
    {
        this.clearEventListener();
        this.m.TroopQuarter.destroy();
        this.m.TroopQuarter = null;
        oldDestroy();
    }

    local oldShowLastActiveDialog = o.showLastActiveDialog;
    o.showLastActiveDialog = function()
    {
        if (this.m.LastActiveModule == this.m.TroopQuarter)
        {
            this.showQuarterDialog();
        }
        else
        {
            oldShowLastActiveDialog();
        }
    }

    o.showQuarterDialog <- function()
	{
		if (this.m.JSHandle != null && this.isVisible())
		{
            this.World.Assets.updateFormation();
			this.m.LastActiveModule = this.m.TroopQuarter;
			::Tooltip.hide();
			this.m.JSHandle.asyncCall("showTroopQuarterDialog", this.m.TroopQuarter.queryLoad());
            this.m.TroopQuarter.pushUIMenuStack(); //make sure when you press Esc, you will return to the town main screen
		}
	}

    local oldIsAnimating = o.isAnimating
	o.isAnimating = function()
	{
        if (this.m.TroopQuarter != null && this.m.TroopQuarter.isAnimating()) return true;
        return oldIsAnimating();
	}

});

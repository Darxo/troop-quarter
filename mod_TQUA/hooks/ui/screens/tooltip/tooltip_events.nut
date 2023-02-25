/*

    local entity = this.Tactical.getEntityByID(_entityId);

    if (entity != null)
    {
        return entity.getRosterTooltip();
    }

    return null;

*/

/*
::mods_hookNewObject("ui/screens/tooltip/tooltip_events", function(o)
{
    local oldGeneral_queryUIElementTooltipData = o.general_queryUIElementTooltipData;
    o.general_queryUIElementTooltipData = function ( _entityId, _elementId, _elementOwner )
    {
        if (_entityId != null && _elementId == "modTQUA.CharacterTooltip")
        {
            local entity = ::Tactical.getEntityByID(_entityId);
            local ret = entity.getRosterTooltip();

            if (entity.getFaction() != ::Const.Faction.Player)
            {
                foreach( entry in ret )
                {
                    if (entry.id == 1 && entry.type == "title")
                    {

                    }
                }
            }

            return ret;
        }

        _entity.getFaction() == this.Const.Faction.PlayerAnimals

        return oldGeneral_queryUIElementTooltipData(_entityId, _elementId, _elementOwner);
    }
});
*/

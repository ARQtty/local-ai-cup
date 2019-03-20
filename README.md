# local-ai-cup

Simple 2d game for introduction to AI agents.

## Rules
Players push their agents (bots) to control units on field. Field divided with cells and has war fog. In one sell may be unit or food or nothing. Players take their turns with order, one by one

## Agents
In basicBots.js you can find simple bots which decribes working with game api.
API methods:
.moveUp(unit) (/-Down/-Left/-Right)
isFree(cell)
isFood(cell)
inVisible(unit)

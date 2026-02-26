# Fluke

BetterFluxer real

I made this because I thought it would be funny for some reason.
I can't decide if this is a good idea or not, but the app is open-source so this does feel like an excessively challenging way to do things (even if you do want the flexibility of runtime patches there might be better ways).

Right now this is basically a proof-of-concept - and only a browser extension because it seemed like the easiest way to do this..

No easy download for non-teccy users right now (it's really just an experiment), but if you have what it takes you just run:
```
pnpm build
```
then go to chrome://extensions and press Load Unpacked and select the repo folder.

On Firefox, you can go to about:debugger, press This Firefox and press "Load Temporary Add-on" - this time select the manifest.json inside the folder though. Unsigned extensions don't persist after restart unfortunately :(

Unfortunately this currently disables CSP which is not very secure :(
Not sure if there's any good way around this with Manifest V3 extensions.

The following repos helped work out how to hook things and stuff:
- [Vencord](https://github.com/Vendicated/Vencord)
- [Rinisky](https://github.com/rniii/rinisky)
- [WebpackGrabber](https://github.com/Vendicated/WebpackGrabber)

## License
```
    Fluke - Fluxer Client Mod
    Copyright (C) 2025 TheKodeToad

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

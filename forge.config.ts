import type { ForgeConfig } from '@electron-forge/shared-types';
import * as dotenv from 'dotenv';
dotenv.config();

import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { PublisherGithub } from '@electron-forge/publisher-github';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon.ico',
    extraResource: [
      "./champion_skins_full.json",
      "./champion_metadata.json",
    ]
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'ModSkinLoL',
      setupIcon: './assets/icon.ico', // icon installer
      iconUrl: 'https://raw.githubusercontent.com/YarC7/mod-skin-lol/main/assets/icon.ico',
      noMsi: true, // Skip MSI generation (faster build)
    }),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'YarC7',
        name: 'mod-skin-lol',
      },
      prerelease: false,   // true nếu beta
      draft: false,         // tạo draft release (rất nên)
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.tsx',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;

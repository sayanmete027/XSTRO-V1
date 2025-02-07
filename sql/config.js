import fs from 'fs';
import path from 'path';

const store = path.join('config.json');

if (!fs.existsSync(store)) {
  fs.writeFileSync(
    store,
    JSON.stringify(
      {
        autoRead: false,
        autoStatusRead: false,
        cmdReact: true,
        cmdRead: false,
        mode: false,
        PREFIX: '.',
        disabledCmds: [],
        autolikestatus: false,
        disablegc: false,
        disabledm: false,
      },
      null,
      2
    )
  );
}

const readConfig = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeConfig = (config) => fs.writeFileSync(store, JSON.stringify(config, null, 2));

async function ensureConfigExists() {
  let config = readConfig();
  if (!config) {
    config = {
      autoRead: false,
      autoStatusRead: false,
      cmdReact: true,
      cmdRead: false,
      mode: false,
      PREFIX: '.',
      disabledCmds: [],
      autolikestatus: false,
      disablegc: false,
      disabledm: false,
    };
    writeConfig(config);
  }
  return config;
}

async function updateConfig(field, value) {
  let config = await ensureConfigExists();

  if (field === 'disabledCmds' && Array.isArray(value)) {
    const currentCmds = config.disabledCmds || [];
    const newCmds = [...new Set([...currentCmds, ...value])];
    config.disabledCmds = newCmds;
    writeConfig(config);
  } else {
    const updatedValue = field === 'PREFIX' ? value : !!value;
    config[field] = updatedValue;
    writeConfig(config);
  }

  return config;
}

async function getConfig() {
  const config = await ensureConfigExists();
  return {
    autoRead: config.autoRead,
    autoStatusRead: config.autoStatusRead,
    cmdReact: config.cmdReact,
    cmdRead: config.cmdRead,
    mode: config.mode,
    PREFIX: config.PREFIX,
    disabledCmds: config.disabledCmds || [],
    autolikestatus: config.autolikestatus,
    disablegc: config.disablegc,
    disabledm: config.disabledm,
  };
}

async function addDisabledCmd(cmd) {
  let config = await ensureConfigExists();
  const currentCmds = config.disabledCmds || [];

  if (currentCmds.includes(cmd)) {
    return { success: false, message: '_Command already disabled._' };
  }

  currentCmds.push(cmd);
  config.disabledCmds = currentCmds;
  writeConfig(config);
  return { success: true, message: `_${cmd} command disabled_` };
}

async function removeDisabledCmd(cmd) {
  let config = await ensureConfigExists();
  const currentCmds = config.disabledCmds || [];

  if (!currentCmds.includes(cmd)) {
    return { success: false, message: '_Command is not disabled._' };
  }

  const updatedCmds = currentCmds.filter((disabledCmd) => disabledCmd !== cmd);
  config.disabledCmds = updatedCmds;
  writeConfig(config);
  return { success: true, message: `_${cmd} command enabled_` };
}

async function isCmdDisabled(cmd) {
  const config = await ensureConfigExists();
  const currentCmds = config.disabledCmds || [];
  return currentCmds.includes(cmd);
}

export { updateConfig, getConfig, addDisabledCmd, removeDisabledCmd, isCmdDisabled };

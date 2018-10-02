#!/usr/bin/env python3
import argparse
import sys
import os
import configparser


parser = argparse.ArgumentParser(description='Dev Tools')

parser.add_argument('--profile', action='store_true', help='return default thunderbird profile path for user')
parser.add_argument('--cache', action='store_true', help='return default thunderbird cache path for user')
parser.add_argument('--exec', action='store_true', help='return thunderbird command line')

args = parser.parse_args()
if len([x for x in vars(args) if vars(args)[x]==True]) == 0:
    parser.print_help()
    sys.exit()

## read ini
def readini(filename):
    config = configparser.ConfigParser()
    config.sections()
    config.read(filename)
    for s in config.sections():
        if 'Default' in config[s] and config[s]['Default']=="1":
            profilepath = config[s]['Path']
            if config[s]['IsRelative']=="1":
                profilepath = os.path.join(os.path.dirname(filename), profilepath)
            return profilepath



## platform specific 
# TODO: add linux
def _darwin():
    profilesini = os.path.expanduser("~/Library/Thunderbird/profiles.ini")
    profilepath = readini(profilesini)
    cachepath = profilepath.replace( os.path.expanduser("~/Library"),  os.path.expanduser("~/Library/Caches") )
    # TODO: find a way to get it from system
    execpath = "/Applications/Thunderbird.app/Contents/MacOS/thunderbird" #"open -a Thunderbird --args"
    return {
        'profile':profilepath,
        'cache':cachepath,
        'exec': execpath
    }

paths = {
    "darwin": _darwin,
}[sys.platform]()


if args.profile:
    print(paths['profile'])
if args.cache:
    print(paths['cache'])
if args.exec:
    print(paths['exec'])
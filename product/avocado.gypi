{
  'variables': {
    'OS%': 'ios',
  },
  'target_defaults': {
    'default_configuration': 'Release',
    'configurations': {
      'Debug': {
        'defines': [ 'DEBUG', '_DEBUG' ],
        'cflags': [ '-g', '-O0' ],
        'xcode_settings': {
          'GCC_OPTIMIZATION_LEVEL': '0',
          'ONLY_ACTIVE_ARCH': 'YES',      # Build Active Architecture Only
        },
      },
      'Release': {
        'cflags': [ 
          '-O3', 
          '-ffunction-sections', 
          '-fdata-sections', 
          '-fomit-frame-pointer',
        ],
        'ldflags': [ '-s' ],
        'xcode_settings': {
          'GCC_OPTIMIZATION_LEVEL': '3',  # -O3
          'GCC_STRICT_ALIASING': 'YES',
          'ONLY_ACTIVE_ARCH': 'NO',
        },
        'conditions': [
         ['OS=="android"', {
           'cflags!': [ '-O3' ],
           'cflags': [ '-O2' ],
         }]
        ],
      },
    },
    'cflags!': ['-Werror'],
    'conditions': [
      ['OS=="ios"', {
        'link_settings': { 
          'libraries': [ '$(SDKROOT)/System/Library/Frameworks/Foundation.framework' ],
        },
        'xcode_settings': {
          'SYMROOT': '<(DEPTH)/out/xcodebuild/<(OS)',
          'ALWAYS_SEARCH_USER_PATHS': 'NO',
          'GCC_TREAT_WARNINGS_AS_ERRORS': 'NO',
          'SDKROOT': 'iphoneos',
          'TARGETED_DEVICE_FAMILY': '1,2',
          'IPHONEOS_DEPLOYMENT_TARGET': '10.0',
          'USE_HEADERMAP': 'NO',
          'ARCHS': [ '$(ARCHS_STANDARD)' ],   # 'ARCHS': [ '$(ARCHS_STANDARD_32_BIT)' ],
          'SKIP_INSTALL': 'YES',
          'DEBUG_INFORMATION_FORMAT': 'dwarf', # dwarf-with-dsym
          'LD_RUNPATH_SEARCH_PATHS': [
            '$(inherited)', 
            '@executable_path/Frameworks'
          ],
          'ENABLE_BITCODE': 'YES',
          'CLANG_ENABLE_OBJC_ARC': 'YES',
          'VALID_ARCHS': ['arm64', 'x86_64'],
        },
        'cflags_cc': [ '-stdlib=libc++' ], 
      }],
      ['OS=="mac"', {
        'link_settings': { 
          'libraries': [ '$(SDKROOT)/System/Library/Frameworks/Foundation.framework' ],
        },
        'xcode_settings': {
          'SYMROOT': '<(DEPTH)/out/xcodebuild/<(OS)',
          'ALWAYS_SEARCH_USER_PATHS': 'NO',
          'GCC_TREAT_WARNINGS_AS_ERRORS': 'NO',
          'SDKROOT': 'macosx',
          'GCC_CW_ASM_SYNTAX': 'NO',                # No -fasm-blocks
          'GCC_DYNAMIC_NO_PIC': 'NO',               # No -mdynamic-no-pic
                                                    # (Equivalent to -fPIC)
          'GCC_ENABLE_PASCAL_STRINGS': 'NO',        # No -mpascal-strings
          'GCC_THREADSAFE_STATICS': 'NO',           # -fno-threadsafe-statics
          'PREBINDING': 'NO',                       # No -Wl,-prebind
          'MACOSX_DEPLOYMENT_TARGET': '10.7',       # -mmacosx-version-min=10.7
          'USE_HEADERMAP': 'NO',
          'AECHS': ['$(ARCHS_STANDARD)'],           # 'ARCHS': 'x86_64',
          'SKIP_INSTALL': 'YES',
          'DEBUG_INFORMATION_FORMAT': 'dwarf',      # dwarf-with-dsym
          'LD_RUNPATH_SEARCH_PATHS': [
            '$(inherited)', 
            '@executable_path/Frameworks'
          ],
          #'ENABLE_BITCODE': 'YES',
          'CLANG_ENABLE_OBJC_ARC': 'YES',
        },
        'cflags_cc': [ '-stdlib=libc++' ], 
      }],
    ],
    'xcode_settings': {
      'CLANG_CXX_LANGUAGE_STANDARD': 'c++0x',   # -std=c++0x
      'CLANG_CXX_LIBRARY': 'libc++',            # c++11 libc support
       # 'GCC_C_LANGUAGE_STANDARD': 'c99',
      'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',       # -fexceptions
      'GCC_ENABLE_CPP_RTTI': 'YES',             # -frtti / -fno-rtti
    },
    'cflags_cc': [ '-std=c++0x', '-stdlib=libc++' ], 
  },

  'targets': [{
    'target_name': 'avocado',
    'type': 'none',
    'direct_dependent_settings': {
      'defines': [ 
        'av_using_shared', 
      ],
      'xcode_settings': {
        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
        'GCC_ENABLE_CPP_RTTI': 'YES', 
      },
      'cflags_cc': [ '-fexceptions', '-frtti', ], 
    },
    'conditions': [
      ['OS=="android"', { 
        'link_settings': { 
          'libraries': [
            '-llog', 
            '-landroid',
            '-lavocado',
          ],
          'library_dirs': [ 
            '<(DEPTH)/out/avocado/android/jniLibs/${ANDROID_ABI}',
          ],
        },
        'direct_dependent_settings': {
          'include_dirs': [ '<(DEPTH)/out/avocado/include' ],
        },
      }],
      ['OS=="ios"', {
        'link_settings': { 
          'libraries': [ 
            '<(DEPTH)/out/avocado/ios/Frameworks/Avocado.framework',
            '$(SDKROOT)/System/Library/Frameworks/UIKit.framework',
          ],
        },
        'direct_dependent_settings': {
          'mac_framework_dirs': [
            '<(DEPTH)/out/avocado/ios/Frameworks',
          ],
          'mac_bundle_frameworks': [
            '<(DEPTH)/out/avocado/ios/Frameworks/Avocado.framework',
          ],
        },
      }],
    ],
  }],

  'conditions': [
    ['OS=="ios"', {
      'xcode_settings': {
        'SYMROOT': '<(DEPTH)/out/xcodebuild/<(OS)',
        'SDKROOT': 'iphoneos',
      },
    }, 
    'OS=="mac"', {
      'xcode_settings': {
        'SYMROOT': '<(DEPTH)/out/xcodebuild/<(OS)',
        'SDKROOT': 'macosx',
      },
    }],
  ],
}

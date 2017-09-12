/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2015, xuewen.chu
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of xuewen.chu nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL xuewen.chu BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

#ifndef __avocado__gui__player__
#define __avocado__gui__player__

#include "event.h"

/**
 * @ns avocado::gui
 */

av_gui_begin

enum PlayerStatus {
  PLAYER_STATUS_STOP = 0,
  PLAYER_STATUS_START,
  PLAYER_STATUS_PLAYING,
  PLAYER_STATUS_PAUSED,
};

AV_EXPORT extern const GUIEventName GUI_EVENT_PLAYER_WAIT_BUFFER;
AV_EXPORT extern const GUIEventName GUI_EVENT_PLAYER_READY;
AV_EXPORT extern const GUIEventName GUI_EVENT_PLAYER_START_PLAY;
AV_EXPORT extern const GUIEventName GUI_EVENT_PLAYER_ERROR;
AV_EXPORT extern const GUIEventName GUI_EVENT_PLAYER_SOURCE_EOF;
AV_EXPORT extern const GUIEventName GUI_EVENT_PLAYER_PAUSE;
AV_EXPORT extern const GUIEventName GUI_EVENT_PLAYER_RESUME;
AV_EXPORT extern const GUIEventName GUI_EVENT_PLAYER_STOP;
AV_EXPORT extern const GUIEventName GUI_EVENT_PLAYER_SEEK;
AV_EXPORT extern const Map<String, GUIEventName> GUI_EVENT_PLAYER_TABLE;

av_gui_end
#endif

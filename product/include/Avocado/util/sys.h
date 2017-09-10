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

#ifndef __avocado__sys__
#define __avocado__sys__

#include "util.h"
#include "string.h"

av_ns(avocado)
av_ns(sys)

AV_EXPORT int64 time_second();
AV_EXPORT int64 time();
AV_EXPORT int64 time_monotonic();
AV_EXPORT String name();
AV_EXPORT String info();
AV_EXPORT String version();
AV_EXPORT String brand();
AV_EXPORT String subsystem();
AV_EXPORT const Array<String>& languages();
AV_EXPORT String languages_string();
AV_EXPORT String language();
AV_EXPORT bool   is_wifi();
AV_EXPORT bool   is_mobile();
AV_EXPORT int    network_status();
AV_EXPORT bool   is_ac_power();
AV_EXPORT bool   is_battery();
AV_EXPORT float  battery_level();
AV_EXPORT uint64 memory();
AV_EXPORT uint64 used_memory();
AV_EXPORT uint64 available_memory();

av_end av_end
#endif

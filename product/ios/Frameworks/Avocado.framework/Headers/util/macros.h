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

#ifndef __avocado__macros__
#define __avocado__macros__

#if !defined(__cplusplus)
# error "Please use the c++ compiler"
#endif

#if __cplusplus < 201103L
# error "The compiler does not support c++ 11"
#endif

#include "env.h"

// This macro allows to test for the version of the GNU C++ compiler.
// Note that this also applies to compilers that masquerade as GCC,
// for example clang and the Intel C++ compiler for Linux.
// Use like:
//  #if V8_GNUC_PREREQ(4, 3, 1)
//   ...
//  #endif
#if defined(__GNUC__) && defined(__GNUC_MINOR__) && defined(__GNUC_PATCHLEVEL__)
# define av_gnuc_prereq(major, minor, patchlevel) \
((__GNUC__ * 10000 + __GNUC_MINOR__ * 100 + __GNUC_PATCHLEVEL__) >= \
((major) * 10000 + (minor) * 100 + (patchlevel)))
#elif defined(__GNUC__) && defined(__GNUC_MINOR__)
# define av_gnuc_prereq(major, minor, patchlevel) \
((__GNUC__ * 10000 + __GNUC_MINOR__ * 100) >= \
((major) * 10000 + (minor) * 100 + (patchlevel)))
#else
# define av_gnuc_prereq(major, minor, patchlevel) 0
#endif

#if av_clang
# define av_has_attribute_always_inline (__has_attribute(always_inline))
# define av_has_attribute_visibility (__has_attribute(visibility))
#elif av_gnuc
// always_inline is available in gcc 4.0 but not very reliable until 4.4.
// Works around "sorry, unimplemented: inlining failed" build errors with
// older compilers.
# define av_has_attribute_always_inline (av_gnuc_prereq(4, 4, 0))
# define av_has_attribute_visibility (av_gnuc_prereq(4, 3, 0))
#elif av_msc
# define av_has_forceinline 1
#endif

// ------------------------------------------------------------------

#if DEBUG
# define av_assert(cond) if(!(cond)) av_fatal("")
# define av_debug(msg, ...) avocado::console::log( msg, ##__VA_ARGS__)
#else
# define av_assert(cond)    ((void)0)
# define av_debug(msg, ...) ((void)0)
#endif

#define av_ns(name) namespace name {
#define av_end };
#define av_gui_begin av_ns(avocado) av_ns(gui)
#define av_gui_end av_end av_end

#define av_def_inl_cls(Inl) public: class Inl; friend class Inl; private:
#define av_def_inl_members(cls, Inl) \
  static av_inline cls::Inl* Inl##_##cls(cls* self) { \
    return reinterpret_cast<cls::Inl*>(self); \
  } class cls::Inl: public cls

#define LOG(msg, ...)         avocado::console::log(msg, ##__VA_ARGS__)
#define WARN(msg, ...)        avocado::console::warn(msg, ##__VA_ARGS__)
#define av_err(msg, ...)      avocado::console::error(msg, ##__VA_ARGS__)
#define av_print(msg, ...)    avocado::console::print(msg, ##__VA_ARGS__)
#define av_print_err(msg, ...)avocado::console::print_err(msg, ##__VA_ARGS__)
#define av_fatal(msg, ...)    avocado::fatal(__FILE__, __LINE__, __func__, msg, ##__VA_ARGS__)
#define av_unimplemented()    av_fatal("Unimplemented code")
#define av_unreachable()      av_fatal("Unreachable code")
#define av_min(A, B)	        ((A) < (B) ? (A) : (B))
#define av_max(A, B)	        ((A) > (B) ? (A) : (B))

// ------------------------------------------------------------------

#if av_msc

#ifdef av_building_shared
# define AV_EXPORT __declspec(dllexport)
#elif av_using_shared
# define AV_EXPORT __declspec(dllimport)
#else
# define AV_EXPORT
#endif  // av_building_shared

#else  // av_msc

// Setup for Linux shared library export.
#if av_has_attribute_visibility
# ifdef av_building_shared
#  define AV_EXPORT __attribute__ ((visibility("default")))
# else
#  define AV_EXPORT
# endif
#else
# define AV_EXPORT
#endif

#endif // av_msc


#if av_msc
# pragma section(".CRT$XCU", read)
# define av_init_block(fn)	\
extern void __cdecl fn(void);	\
__declspec(dllexport, allocate(".CRT$XCU"))	\
void (__cdecl*fn ## _)(void) = fn;	\
extern void __cdecl fn(void)
#else // av_msc
# define av_init_block(fn)	\
extern __attribute__((constructor)) void __##fn(void)
#endif

// A macro used to make better inlining. Don't bother for debug builds.
//
#if av_has_attribute_always_inline && !DEBUG
# define av_inline inline __attribute__((always_inline))
#elif av_has_forceinline && !DEBUG
# define av_inline __forceinline
#else
# define av_inline inline
#endif
#undef av_has_attribute_always_inline
#undef av_has_forceinline

#define av_hidden_copy_constructor(T)  private: T(const T& t) = delete;
#define av_hidden_assign_operator(T)   private: T& operator=(const T& t) = delete;
#define av_hidden_all_copy(T)	\
  private: T(const T& t) = delete;	\
  private: T& operator=(const T& t) = delete;

// Helper macros end
// -----------------------------------------------------------------------------

#endif

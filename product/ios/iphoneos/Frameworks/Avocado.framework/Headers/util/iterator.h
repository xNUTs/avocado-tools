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

#ifndef __avocado__iterator__
#define __avocado__iterator__

#include "util.h"

av_ns(avocado)

/**
 * @class ConstIteratorTemplate
 * @template<class IteratorData>
 */
template<class IteratorData> class ConstIteratorTemplate {
public:
  typedef typename IteratorData::Value Value;
  
  inline ConstIteratorTemplate(): data_() { }
  inline ConstIteratorTemplate(const IteratorData& data): data_(data) { }
  
  inline const Value& value() const { return data_.value(); }
  inline const IteratorData& operator*() const { return data_; }
  inline const IteratorData& data() const { return data_; }
  //
  inline bool operator==(const ConstIteratorTemplate& it) const { return data_.equals(it.data_); }
  inline bool operator!=(const ConstIteratorTemplate& it) const { return !data_.equals(it.data_); }
  //
  inline bool is_null() const { return data_.is_null(); }
  
  inline ConstIteratorTemplate operator++() { // ++i
    data_.next();
    return *this;
  }
  
  inline ConstIteratorTemplate operator--() { // --i
    data_.prev();
    return *this;
  }
  
  inline ConstIteratorTemplate operator++(int) { // i++
    ConstIteratorTemplate rev(*this);
    data_.next();
    return rev;
  }
  
  inline ConstIteratorTemplate operator--(int) { // i--
    ConstIteratorTemplate rev(*this);
    data_.prev();
    return rev;
  }
  
protected:
  IteratorData data_;
};

/**
 * @class IteratorTemplate
 * @template<class Iterator, class Value>
 */
template<class IteratorData>
class IteratorTemplate: public ConstIteratorTemplate<IteratorData> {
public:
  typedef typename IteratorData::Value Value;
  
  inline IteratorTemplate(): ConstIteratorTemplate<IteratorData>() { }
  inline IteratorTemplate(const IteratorData& data): ConstIteratorTemplate<IteratorData>(data) { }
  
  inline const Value& value() const { return this->data_.value(); }
  inline Value& value() { return this->data_.value(); }
  //
  inline const IteratorData& operator*() const { return this->data_; }
  inline IteratorData& operator*() { return this->data_; }
  //
  inline const IteratorData& data() const { return this->data_; }
  inline IteratorData& data() { return this->data_; }
  
  inline IteratorTemplate operator++() { // ++i
    this->data_.next();
    return *this;
  }
  
  inline IteratorTemplate operator--() { // --i
    this->data_.prev();
    return *this;
  }
  
  inline IteratorTemplate operator++(int) { // i++
    IteratorTemplate rev(*this);
    this->data_.next();
    return rev;
  }
  
  inline IteratorTemplate operator--(int) { // i--
    IteratorTemplate rev(*this);
    this->data_.prev();
    return rev;
  }
};

av_end

#endif

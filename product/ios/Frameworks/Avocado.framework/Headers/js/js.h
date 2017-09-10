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

#ifndef __avocado__ajs__js__
#define __avocado__ajs__js__

#include "Avocado/util/util.h" 
#include "Avocado/util/string.h"
#include "Avocado/util/buffer.h"
#include "Avocado/util/map.h"
#include "Avocado/util/error.h"
#include "Avocado/util/event.h"
#include "Avocado/util/fs.h"
#include "Avocado/util/thread.h"

/**
 * 这里提供的api是对v8与javascriptcore的包裹,
 * 在ios系统上使用jvavscriptcore,android使用v8
 */

// ------------- ajs common macro -------------

#define ajs_begin         av_ns(avocado) av_ns(js)
#define ajs_end           av_end av_end
#define ajs_ns(name)      ajs_begin av_ns(name)
#define ajs_nsd           ajs_end av_end
#define ajs_worker(args)  auto worker = (args).worker()
#define ajs_cur_worker()  auto worker = avocado::js::Worker::current()
#define ajs_unpack(type)  auto wrap = avocado::js::Wrap<type>::unpack(args.This())
#define ajs_self(type)    auto self = Wrap<type>::unpack(args.This())->self()
#define ajs_return(rev)   return worker->result(args, (rev))
#define ajs_return_null() return worker->result(args, worker->NewNull())

#define ajs_throw_range_err(err, ...) \
  return worker->throw_err(worker->NewRangeError((err), ##__VA_ARGS__))

#define ajs_throw_reference_err(err, ...) \
  return worker->throw_err(worker->NewReferenceError((err), ##__VA_ARGS__))

#define ajs_throw_syntax_err(err, ...) \
  return worker->throw_err(worker->NewSyntaxError((err), ##__VA_ARGS__))

#define ajs_throw_type_err(err, ...) \
  return worker->throw_err(worker->NewTypeError((err), ##__VA_ARGS__))

#define ajs_throw_err(err, ...)  return worker->throw_err(worker->NewError((err), ##__VA_ARGS__))
#define ajs_try_catch(block, Error) try block catch(const Error& e) { ajs_throw_err(e); }
#define ajs_handle_scope()  HandleScope scope(worker)

#define ajs_typeid(t) (typeid(t).hash_code())

#define ajs_reg_module(name, cls) \
  av_init_block(ajs_reg_module_##name) { avocado::js::Worker::reg_module(#name, cls::binding); }

#define ajs_new_class(name, constructor, block, base) \
  struct Attach { static void Callback(WrapObject* o) { \
  static_assert(sizeof(WrapObject)==sizeof(Wrap##name), \
    "Derived wrap class pairs cannot declare data members"); new(o) Wrap##name(); \
  }}; \
  auto cls = worker->NewClass(ajs_typeid(name), #name, \
  constructor, &Attach::Callback, base); block; ((void*)0)

#define ajs_define_class(name, constructor, block, base) \
  ajs_new_class(name, constructor, block, ajs_typeid(base)); cls->Export(worker, #name, exports)

#define ajs_define_class_no_exports(name, constructor, block, base) \
  ajs_new_class(name, constructor, block, ajs_typeid(base))

#define ajs_set_cls_method(name, func)      cls->SetMemberMethod(worker, #name, func)
#define ajs_set_cls_accessor(name, get, ...)cls->SetMemberAccessor(worker, #name, get, ##__VA_ARGS__)
#define ajs_set_cls_indexed(get, ...)       cls->SetMemberIndexedAccessor(worker, get, ##__VA_ARGS__)
#define ajs_set_cls_property(name, value)   cls->SetMemberProperty(worker, #name, value)
#define ajs_set_cls_static_property(name, value)cls->SetStaticProperty(worker, #name, value)
#define ajs_set_method(name, func)          exports->SetMethod(worker, #name, func)
#define ajs_set_accessor(name, get, ...)    exports->SetAccessor(worker, #name, get, ##__VA_ARGS__)
#define ajs_set_property(name, value)       exports->SetProperty(worker, #name, value)

#define ajs_bind_native_event( name, type, block) \
  av_on(name, [this, func]( type & evt) { HandleScope scope(worker()); block }, id)

#define ajs_bind_common_native_event( name ) \
  ajs_bind_native_event(name, Event<>, { call(worker()->New(func,1)); })

#define ajs_unbind_native_event( name ) av_off(name, id);

#define ajs_attach(args) if (WrapObject::attach(args)) return

#define ajs_type_check(T, S)  \
while (false) { \
  *(static_cast<T* volatile*>(0)) = static_cast<S*>(0); \
}

namespace avocado {
  class HttpError;
}

/**
 * @ns avocado::js
 */

ajs_begin

namespace gui {
  class ValueProgram;
}

using gui::ValueProgram;

class Worker;
class V8Worker;
class JSCWorker;
class WrapObject;
class Allocator;
class CommonStrings;
template<class T> class Maybe;
template<class T> class Local;
template<class T> class NonCopyablePersistentTraits;
template<class T> class PersistentBase;
template <class T, class M = NonCopyablePersistentTraits<T> >
class Persistent;
class JSValue;
class JSString;
class JSObject;
class JSArray;
class JSDate;
class JSNumber;
class JSInt32;
class Integer;
class JSUint32;
class JSBoolean;
class JSFunction;
class JSArrayBuffer;
class JSClass;

template<class T> class AV_EXPORT Maybe {
public:
  av_inline bool Ok() const { return val_ok_; }
  av_inline bool To(T& out) {
    if ( val_ok_ ) {
      out = move(val_); return true;
    }
    return false;
  }
  av_inline T FromMaybe(const T& default_value) {
    return val_ok_ ? move(val_) : default_value;
  }
private:
  Maybe() : val_ok_(false) {}
  explicit Maybe(const T& t) : val_ok_(true), val_(t) {}
  explicit Maybe(T&& t) : val_ok_(true), val_(move(t)) {}
  bool val_ok_;
  T val_;
  friend class JSValue;
  friend class JSArray;
  friend class JSObject;
};

template<class T> class AV_EXPORT Local {
public:
  av_inline Local() : val_(0) {}
  
  template <class S>
  av_inline Local(Local<S> that)
  : val_(reinterpret_cast<T*>(*that)) {
    ajs_type_check(T, S);
  }
  
  av_inline bool IsEmpty() const { return val_ == 0; }
  av_inline void Clear() { val_ = 0; }
  av_inline T* operator->() const { return val_; }
  av_inline T* operator*() const { return val_; }

  template <class S> av_inline static Local<T> Cast(Local<S> that) {
    return Local<T>( static_cast<T*>(*that) );
  }
  
  template <class S = JSObject> av_inline Local<S> To() const {
    // unsafe conversion 
    return Local<S>::Cast(*this);
  }
  
private:
  friend class JSValue;
  friend class JSFunction;
  friend class JSString;
  friend class JSClass;
  friend class Worker;
  explicit av_inline Local(T* that) : val_(that) { }
  
  T* val_;
};

template<class T> class AV_EXPORT PersistentBase {
  av_hidden_all_copy(PersistentBase);
public:
  typedef void (*WeakCallback)(void* ptr);
  
  av_inline void Reset() {
    ajs_type_check(JSValue, T);
    reinterpret_cast<PersistentBase<JSValue>*>(this)->Reset();
  }
  
  template <class S>
  av_inline void Reset(Worker* worker, const Local<S>& other) {
    ajs_type_check(T, S);
    ajs_type_check(JSValue, T);
    reinterpret_cast<PersistentBase<JSValue>*>(this)->
    Reset(worker, *reinterpret_cast<const Local<JSValue>*>(&other));
  }
  
  template <class S>
  av_inline void Reset(Worker* worker, const PersistentBase<S>& other) {
    ajs_type_check(T, S);
    reinterpret_cast<PersistentBase<JSValue>*>(this)->Reset(worker, other.strong());
  }
  
  av_inline bool IsEmpty() const { return val_ == 0; }
    
  inline Local<T> strong() const {
    return *reinterpret_cast<Local<T>*>(const_cast<PersistentBase*>(this));
  }
  
private:
  friend class WrapObject;
  friend class Worker;
  template<class F1, class F2> friend class Persistent;
  av_inline PersistentBase(): val_(0), worker_(0) { }
  template<class S> void Copy(const PersistentBase<S>& that);
  
  T* val_;
  Worker* worker_;
};

template<class T> class AV_EXPORT NonCopyablePersistentTraits {
public:
  static constexpr bool kResetInDestructor = true;
  av_inline static void CopyCheck() { Uncompilable<Object>(); }
  template<class O> static void Uncompilable() {
    ajs_type_check(O, JSValue);
  }
};

template<class T> class AV_EXPORT CopyablePersistentTraits {
public:
  typedef Persistent<T, CopyablePersistentTraits<T>> Handle;
  static constexpr bool kResetInDestructor = true;
  static av_inline void CopyCheck() { }
};

template<class T, class M> class AV_EXPORT Persistent: public PersistentBase<T> {
public:
  av_inline Persistent() { }
  
  template <class S>
  av_inline Persistent(Worker* worker, Local<S> that) {
    this->Reset(worker, that);
  }
  
  template <class S, class M2>
  av_inline Persistent(Worker* worker, const Persistent<S, M2>& that) {
    this->Reset(worker, that);
  }
  
  av_inline Persistent(const Persistent& that) {
    Copy(that);
  }
  
  template<class S, class M2>
  av_inline Persistent(const Persistent<S, M2>& that) {
    Copy(that);
  }
  
  av_inline Persistent& operator=(const Persistent& that) {
    Copy(that);
    return *this;
  }
  
  template <class S, class M2>
  av_inline Persistent& operator=(const Persistent<S, M2>& that) {
    Copy(that);
    return *this;
  }
  
  ~Persistent() { if(M::kResetInDestructor) this->Reset(); }
  
private:
  
  template<class F1, class F2> friend class Persistent;
  
  template<class S>
  av_inline void Copy(const PersistentBase<S>& that) {
    M::CopyCheck();
    ajs_type_check(T, S);
    ajs_type_check(JSValue, T);
    this->Reset();
    if ( that.IsEmpty() ) return;
    reinterpret_cast<PersistentBase<JSValue>*>(this)->
      Copy(*reinterpret_cast<const PersistentBase<JSValue>*>(&that));
  }
};

typedef CopyablePersistentTraits<JSClass>::Handle CopyablePersistentClass;
typedef CopyablePersistentTraits<JSFunction>::Handle CopyablePersistentFunc;
typedef CopyablePersistentTraits<JSObject>::Handle CopyablePersistentObject;
typedef CopyablePersistentTraits<JSValue>::Handle CopyablePersistentValue;

template <> 
AV_EXPORT void PersistentBase<JSValue>::Reset();
template <> 
AV_EXPORT void PersistentBase<JSClass>::Reset();
template <> template <>  
AV_EXPORT void PersistentBase<JSValue>::Reset(Worker* worker, const Local<JSValue>& other);
template <> template <> 
AV_EXPORT void PersistentBase<JSClass>::Reset(Worker* worker, const Local<JSClass>& other);
template<> template<> 
AV_EXPORT void PersistentBase<JSValue>::Copy(const PersistentBase<JSValue>& that);
template<> template<> 
AV_EXPORT void CopyablePersistentClass::Copy(const PersistentBase<JSClass>& that);

class AV_EXPORT ReturnValue {
public:
  template <class S>
  inline void Set(Local<S> value) {
    ajs_type_check(JSValue, S);
    Set(*reinterpret_cast<Local<JSValue>*>(&value));
  }
  void Set(bool value);
  void Set(double i);
  void Set(int i);
  void Set(uint i);
  void SetNull();
  void SetUndefined();
  void SetEmptyString();
private:
  void* val_;
};

template<> AV_EXPORT void ReturnValue::Set<JSValue>(Local<JSValue> value);

class AV_EXPORT FunctionCallbackInfo { public:
  Worker* worker() const;
  int Length() const;
  Local<JSValue> operator[](int i) const;
  Local<JSObject> This() const;
  bool IsConstructCall() const;
  ReturnValue GetReturnValue() const;
};

class AV_EXPORT PropertyCallbackInfo { public:
  Worker* worker() const;
  Local<JSObject> This() const;
  ReturnValue GetReturnValue() const;
};

class AV_EXPORT PropertySetCallbackInfo { public:
  Worker* worker() const;
  Local<JSObject> This() const;
};

typedef const FunctionCallbackInfo& FunctionCall;
typedef const PropertyCallbackInfo& PropertyCall;
typedef const PropertySetCallbackInfo& PropertySetCall;
typedef void (*FunctionCallback)(FunctionCall args);
typedef void (*AccessorGetterCallback)(Local<JSString> name, PropertyCall args);
typedef void (*AccessorSetterCallback)(Local<JSString> name, Local<JSValue> value, PropertySetCall args);
typedef void (*IndexedPropertyGetterCallback)(uint index, PropertyCall info);
typedef void (*IndexedPropertySetterCallback)(uint index, Local<JSValue> value, PropertyCall info);

class AV_EXPORT HandleScope {
  av_hidden_all_copy(HandleScope);
public:
  HandleScope(Worker* worker);
  ~HandleScope();
private:
  void* val_;
};

class AV_EXPORT JSValue {
  av_hidden_all_copy(JSValue); public:
  
  bool IsUndefined() const;
  bool IsUndefined(Worker* worker) const;
  bool IsNull() const;
  bool IsNull(Worker* worker) const;
  bool IsString() const;
  bool IsString(Worker* worker) const;
  bool IsBoolean() const;
  bool IsBoolean(Worker* worker) const;
  bool IsObject() const;
  bool IsObject(Worker* worker) const;
  bool IsArray() const;
  bool IsArray(Worker* worker) const;
  bool IsDate() const;
  bool IsDate(Worker* worker) const;
  bool IsNumber() const;
  bool IsNumber(Worker* worker) const;
  bool IsUint32() const;
  bool IsUint32(Worker* worker) const;
  bool IsInt32() const;
  bool IsInt32(Worker* worker) const;
  bool IsFunction() const;
  bool IsFunction(Worker* worker) const;
  bool IsArrayBuffer() const;
  bool IsArrayBuffer(Worker* worker) const;
  bool Equals(Local<JSValue> val) const;
  bool Equals(Worker* worker, Local<JSValue> val) const;
  bool StrictEquals(Local<JSValue> val) const;
  bool StrictEquals(Worker* worker, Local<JSValue> val) const;
  Local<JSString> ToString(Worker* worker) const;
  Local<JSNumber> ToNumber(Worker* worker) const;
  Local<JSInt32> ToInt32(Worker* worker) const;
  Local<JSUint32> ToUint32(Worker* worker) const;
  Local<JSObject> ToObject(Worker* worker) const;
  Local<JSBoolean> ToBoolean(Worker* worker) const;
  String ToStringValue(Worker* worker, bool ascii = false) const;
  Ucs2String ToUcs2StringValue(Worker* worker) const;
  bool ToBooleanValue(Worker* worker) const;
  double ToNumberValue(Worker* worker) const;
  int ToInt32Value(Worker* worker) const;
  uint ToUint32Value(Worker* worker) const;
  Maybe<double> ToNumberMaybe(Worker* worker) const;
  Maybe<int> ToInt32Maybe(Worker* worker) const;
  Maybe<uint> ToUint32Maybe(Worker* worker) const;
  Buffer ToBuffer(Worker* worker, Encoding en) const;
};

class AV_EXPORT JSString: public JSValue { public:
  int Length(Worker* worker) const;
  String Value(Worker* worker, bool ascii = false) const;
  Ucs2String Ucs2Value(Worker* worker) const;
  static Local<JSString> Empty(Worker* worker);
};

class AV_EXPORT JSObject: public JSValue { public:
  Local<JSValue> Get(Worker* worker, Local<JSValue> key);
  Local<JSValue> Get(Worker* worker, uint index);
  bool Set(Worker* worker, Local<JSValue> key, Local<JSValue> val);
  bool Set(Worker* worker, uint index, Local<JSValue> val);
  bool Has(Worker* worker, Local<JSValue> key);
  bool Has(Worker* worker, uint index);
  bool Delete(Worker* worker, Local<JSValue> key);
  bool Delete(Worker* worker, uint index);
  Local<JSArray> GetPropertyNames(Worker* worker);
  Maybe<Map<String, int>> ToIntegerMapMaybe(Worker* worker);
  Maybe<Map<String, String>> ToStringMapMaybe(Worker* worker);
  Local<JSValue> GetProperty(Worker* worker, cString& name);
  Local<JSFunction> GetConstructor(Worker* worker);
  template<class T>
  bool SetProperty(Worker* worker, cString& name, T value);
  bool SetMethod(Worker* worker, cString& name, FunctionCallback func);
  bool SetAccessor(Worker* worker, cString& name,
                   AccessorGetterCallback get, AccessorSetterCallback set = nullptr);
};

class AV_EXPORT JSArray: public JSObject { public:
  int Length(Worker* worker) const;
  Maybe<Array<String>> ToStringArrayMaybe(Worker* worker);
  Maybe<Array<double>> ToNumberArrayMaybe(Worker* worker);
  Maybe<Buffer> ToBufferMaybe(Worker* worker);
};

class AV_EXPORT JSDate: public JSObject { public:
  double ValueOf(Worker* worker) const;
};

class AV_EXPORT JSNumber: public JSValue { public:
  double Value(Worker* worker) const;
};

class AV_EXPORT JSInt32: public JSNumber { public:
  int Value(Worker* worker) const;
};

class AV_EXPORT Integer: public JSNumber { public:
  int64 Value(Worker* worker) const;
};

class AV_EXPORT JSUint32: public JSNumber { public:
  uint Value(Worker* worker) const;
};

class AV_EXPORT JSBoolean: public JSValue { public:
  bool Value(Worker* worker) const;
};

class AV_EXPORT JSFunction: public JSObject { public:
  Local<JSValue> Call(Worker* worker, int argc = 0,
                      Local<JSValue> argv[] = nullptr,
                      Local<JSValue> recv = Local<JSValue>());
  Local<JSValue> Call(Worker* worker, Local<JSValue> recv);
  Local<JSObject> NewInstance(Worker* worker,
                              int argc = 0,
                              Local<JSValue> argv[] = nullptr);
};

class AV_EXPORT JSArrayBuffer: public JSObject { public:
  int ByteLength(Worker* worker) const;
  char* Data(Worker* worker);
  static Local<JSArrayBuffer> New(Worker* worker, char* buff, uint len);
};

class AV_EXPORT JSClass { public:
  bool HasInstance(Worker* worker, Local<JSValue> val);
  bool SetMemberMethod(Worker* worker, cString& name, FunctionCallback func);
  bool SetMemberAccessor(Worker* worker, cString& name,
                         AccessorGetterCallback get,
                         AccessorSetterCallback set = nullptr);
  bool SetMemberIndexedAccessor(Worker* worker,
                                IndexedPropertyGetterCallback get,
                                IndexedPropertySetterCallback set = nullptr);
  template<class T>
  bool SetMemberProperty(Worker* worker, cString& name, T value);
  template<class T>
  bool SetStaticProperty(Worker* worker, cString& name, T value);
  void Export(Worker* worker, cString& name, Local<JSObject> exports);
  uint64 ID() const;
  Local<JSObject> NewInstance(uint argc = 0, Local<JSValue>* argv = nullptr);
};

class AV_EXPORT TryCatch {
  av_hidden_all_copy(TryCatch);
public:
  TryCatch();
  ~TryCatch();
  bool HasCaught() const;
  Local<JSValue> Exception() const;
private:
  void* val_;
};

/**
 * @class Worker
 */
class AV_EXPORT Worker: public Object {
  av_hidden_all_copy(Worker);
public:
  
  typedef void  (*BindingCallback)(Local<JSObject> exports, Worker* worker);
  typedef void  (*WrapAttachCallback)(WrapObject* wrap);
  
private: Worker(const Array<String>& args = Array<String>());
public:
  
  /**
   * @destructor
   */
  virtual ~Worker();
  
  /**
   * @func initializ
   */
  static void initialize();
  
  /**
   * @func dispose
   */
  static void dispose();
  
  /**
   * @func current
   */
  static Worker* current();
  
  /**
   * @func reg_module
   */
  static void reg_module(cString& name, BindingCallback binding);
  
  /**
   * @func del_module
   */
  static void del_module(cString& name);
  
  /**
   * @func binding_module
   */
  Local<JSObject> binding_module(Local<JSValue> name);
  Local<JSObject> binding_module(cString& name);
  
  /**
   * @func New()
   */
  Local<JSNumber> New(float data);
  Local<JSNumber> New(double data);
  Local<JSBoolean>New(bool data);
  Local<JSInt32>  New(char data);
  Local<JSUint32> New(byte data);
  Local<JSInt32>  New(int16 data);
  Local<JSUint32> New(uint16 data);
  Local<JSInt32>  New(int data);
  Local<JSUint32> New(uint data);
  Local<JSNumber> New(int64 data);
  Local<JSNumber> New(uint64 data);
  Local<JSString> New(cchar* data);
  Local<JSString> New(cString& data, bool is_ascii = false);
  Local<JSString> New(cUcs2String& data);
  Local<JSObject> New(cError& data);
  Local<JSObject> New(const HttpError& err);
  Local<JSArray>  New(const Array<String>& data);
  Local<JSArray>  New(Array<FileStat>& data);
  Local<JSArray>  New(Array<FileStat>&& data);
  Local<JSObject> New(const Map<String, String>& data);
  Local<JSObject> New(Buffer& buff);
  Local<JSObject> New(Buffer&& buff);
  Local<JSObject> New(FileStat& stat);
  Local<JSObject> New(FileStat&& stat);
  Local<JSObject> New(const Dirent& dir);
  Local<JSArray>  New(Array<Dirent>& data);
  Local<JSArray>  New(Array<Dirent>&& data);
  
  template <class T>
  av_inline Local<T> New(Local<T> val) { return val; }
  
  template <class T>
  av_inline Local<T> New(const PersistentBase<T>& value) {
    Local<JSValue> r = New(*reinterpret_cast<const PersistentBase<JSValue>*>(&value));
    return *reinterpret_cast<Local<T>*>(&r);
  }
  
  Local<JSValue> New(const PersistentBase<JSValue>& value);
  
  Local<JSObject> NewInstance(uint64 id, uint argc = 0, Local<JSValue>* argv = nullptr);
  Local<JSString> NewString(cBuffer& data);
  Local<JSString> NewString(cchar* str, uint len);
  Local<JSObject> NewBuffer(Local<JSString> str, Encoding enc = Encoding::utf8);
  Local<JSObject> NewRangeError(cchar* errmsg, ...);
  Local<JSObject> NewReferenceError(cchar* errmsg, ...);
  Local<JSObject> NewSyntaxError(cchar* errmsg, ...);
  Local<JSObject> NewTypeError(cchar* errmsg, ...);
  Local<JSObject> NewError(cchar* errmsg, ...);
  Local<JSObject> NewError(cError& err);
  Local<JSObject> NewError(const HttpError& err);
  Local<JSObject> NewError(Local<JSObject> value);
  Local<JSObject> NewObject();
  Local<JSArray>  NewArray(uint len = 0);
  Local<JSValue>  NewNull();
  Local<JSValue>  NewUndefined();
  
  inline Local<JSBoolean> New(const Bool& v) { return New(v.value); }
  inline Local<JSNumber>  New(const Float& v) { return New(v.value); }
  inline Local<JSNumber>  New(const Double& v) { return New(v.value); }
  inline Local<JSInt32>   New(const Char& v) { return New(v.value); }
  inline Local<JSUint32>  New(const Byte& v) { return New(v.value); }
  inline Local<JSInt32>   New(const Int16& v) { return New(v.value); }
  inline Local<JSUint32>  New(const Uint16& v) { return New(v.value); }
  inline Local<JSInt32>   New(const Int& v) { return New(v.value); }
  inline Local<JSUint32>  New(const Uint& v) { return New(v.value); }
  inline Local<JSNumber>  New(const Int64& v) { return New(v.value); }
  inline Local<JSNumber>  New(const Uint64& v) { return New(v.value); }
  
  template<class T>
  static inline Local<JSValue> New(const Object& obj, Worker* worker) {
    return worker->New( static_cast<const T*>(&obj) );
  }
  
  /**
   * @func throw_err
   */
  void throw_err(Local<JSValue> exception);
  void throw_err(cchar* errmsg, ...);
  
  /**
   * @func has_buffer
   */
  bool has_buffer(Local<JSValue> val);
  
  /**
   * @func has_view() has View type
   */
  bool has_view(Local<JSValue> val);
  
  /**
   * @func has_instance
   */
  bool has_instance(Local<JSValue> val, uint64 id);
  
  /**
   * @func has_instance
   */
  template<class T> inline bool has_instance(Local<JSValue> val) {
    return has_instance(val, ajs_typeid(T));
  }
  
  /**
   * @func jsclass(id) find class
   */
  Local<JSClass> jsclass(uint id);
  
  /**
   * @func result
   */
  template <class Args, class T>
  inline void result(const Args& args, Local<T> data) {
    args.GetReturnValue().Set( data );
  }
  
  /**
   * @func result
   */
  template <class Args, class T>
  inline void result(const Args& args, const T& data) {
    args.GetReturnValue().Set( New(data) );
  }
  
  /**
   * @func result
   */
  template <class Args, class T>
  inline void result(const Args& args, T&& data) {
    args.GetReturnValue().Set( New(move(data)) );
  }
  
  /**
   * @func NewClass js class
   */
  Local<JSClass> NewClass(uint64 id, cString& name,
                          FunctionCallback constructor,
                          WrapAttachCallback attach_callback,
                          Local<JSClass> base = Local<JSClass>());
  /**
   * @func NewClass js class
   */
  Local<JSClass> NewClass(uint64 id, cString& name,
                          FunctionCallback constructor,
                          WrapAttachCallback attach_callback, uint64 base);
  /**
   * @func NewClass js class
   */
  Local<JSClass> NewClass(uint64 id, cString& name,
                          FunctionCallback constructor,
                          WrapAttachCallback attach_callback, Local<JSFunction> base);
  /**
   * @func run_script
   */
  Local<JSValue> run_script(cString& source,
                            cString& name,
                            Local<JSObject> sandbox = Local<JSObject>());
  /**
   * @func run_script
   */
  Local<JSValue> run_script(Local<JSString> source,
                            Local<JSString> name,
                            Local<JSObject> sandbox = Local<JSObject>());
  /**
   * @func run_native_script
   */
  bool run_native_script(Local<JSObject> exports, cBuffer& source, cString& name);
  
  /**
   * @func gui_value_program
   */
  inline ValueProgram* gui_value_program() { return m_gui_value_program; }
  
  /**
   * @func set_gui_value_program
   */
  void set_gui_value_program(ValueProgram* value) av_def_err;
  
  /**
   * @func strs
   */
  inline CommonStrings* strs() { return m_strs; }
  
  /**
   * @func util
   */
  inline Local<JSObject> util() { return  m_util.strong(); }
  
  /**
   * @func global
   */
  inline Local<JSObject> global() { return m_global.strong(); }
  
  /**
   * @func thread_id
   */
  inline ThreadID thread_id() const { return m_thread_id; }
  
  /**
   * @func args
   */
   inline const Array<String>& args() const { return m_args; }
  
  /**
   * @func debug
   */
  inline bool debug() const { return m_debug; }
  
  /**
   * @func report_exception
   */
  void report_exception(TryCatch* try_catch);
  
  /**
   * @func fatal exit worker
   */
  void fatal(cString& msg);
  
  /**
   * @func garbage_collection()
   */
  void garbage_collection();
  
  /**
   * @func is_terminate()
   */
  inline bool is_terminate() const { return m_terminate; }
  
private:
  
  av_def_inl_cls(InlWorker);
  
  friend class V8Worker;
  friend class JSCWorker;
  
  ThreadID      m_thread_id;
  Array<String> m_args;
  bool          m_debug;
  bool          m_terminate;
  ValueProgram* m_gui_value_program;
  CommonStrings* m_strs;
  Persistent<JSObject>  m_util;
  Persistent<JSObject>  m_binding;
  Persistent<JSObject>  m_global;
  InlWorker*  m_inl;
};

template<class T> 
bool JSObject::SetProperty(Worker* worker, cString& name, T value) {
  return Set(worker, worker->New(name, 1), worker->New(value));
}
template<class T>
bool JSClass::SetMemberProperty(Worker* worker, cString& name, T value) {
  return SetMemberProperty<Local<JSValue>>(worker, name, worker->New(value));
}
template<class T>
bool JSClass::SetStaticProperty(Worker* worker, cString& name, T value) {
  return SetStaticProperty<Local<JSValue>>(worker, name, worker->New(value));
}
template<> AV_EXPORT bool JSClass::SetMemberProperty<Local<JSValue>>
(
 Worker* worker, cString& name, Local<JSValue> value
);
template<> AV_EXPORT bool JSClass::SetStaticProperty<Local<JSValue>>
(
 Worker* worker, cString& name, Local<JSValue> value
);

template<class T> class Wrap;

/**
 * @class WrapObject
 */
class AV_EXPORT WrapObject {
  av_hidden_all_copy(WrapObject);
  void init_(FunctionCall args);
protected:
  
  /**
   * @constructor default
   */
  inline WrapObject(): data_(nullptr) { }
  
  /**
   * @destructor
   */
  virtual ~WrapObject();
  
  /**
   * @func New()
   */
  template<class W, class O>
  static Wrap<O>* New(FunctionCall args, O* object) {
    static_assert(sizeof(W) == sizeof(WrapObject),
                  "Derived wrap class pairs cannot declare data members");
    static_assert(O::Traits::is_object, "Must be object");
    auto wrap = new(reinterpret_cast<WrapObject*>(object) - 1) W();
    wrap->init_(args);
    return static_cast<js::Wrap<O>*>(static_cast<WrapObject*>(wrap));
  }
  
  /**
   * @func attach external object
   */
  static WrapObject* attach(FunctionCall args);

public:
  
  class Data { public:
    virtual ~Data();
    virtual void release();
  };
  
  /**
   * @func initializ
   */
  virtual void initialize();
  
  /**
   * @func worker()
   */
  av_inline Worker* worker() {
    return handle_.worker_;
  }
  
  /**
   * @func add_event_listener
   */
  virtual bool add_event_listener(cString& name, cString& func, int id) {
    // subclass implementation
    return false;
  }
  
  /**
   * @func remove_event_listener
   */
  virtual bool remove_event_listener(cString& name, int id) {
    // subclass implementation
    return false;
  }
  
  /**
   * @func get_data
   */
  inline Data* data() { return data_; }
  
  /**
   * @func set_data
   */
  void set_data(Data* data);
  
  /**
   * @func handle()
   */
  inline Persistent<JSObject>& handle() {
    return handle_;
  }
  
  /**
   * @func that()
   */
  inline Local<JSObject> that() {
    return worker()->New(handle_);
  }
  
  /**
   * @func get()
   */
  inline Local<JSValue> get(Local<JSValue> key) {
    return handle_.strong()->Get(worker(), key);
  }
  
  /**
   * @func set()
   */
  inline bool set(Local<JSValue> key, Local<JSValue> value) {
    return handle_.strong()->Set(worker(), key, value);
  }

  /**
   * @func del()
   */
  inline bool del(Local<JSValue> key) {
    return handle_.strong()->Delete(worker(), key);
  }
  
  /**
   * @func call
   */
  Local<JSValue> call(Local<JSValue> name, int argc = 0, Local<JSValue> argv[] = nullptr);
  
  /**
   * @func call
   */
  Local<JSValue> call(cString& name, int argc = 0, Local<JSValue> argv[] = nullptr);
  
  /**
   * @func self
   */
  template<class T = Object>
  inline T* self() {
    return static_cast<T*>(reinterpret_cast<Object*>(this + 1));
  }
  
  /**
   * @func is_wrap
   */
  static bool is_pack(Local<JSObject> object);
  
  /**
   * @func unpack()
   */
  template<class T = Object>
  static inline Wrap<T>* unpack(Local<JSObject> value) {
    return static_cast<Wrap<T>*>(unpack_(value));
  }
  
  /**
   * @func pack()
   */
  template<class T>
  static inline Wrap<T>* pack(T* object) {
    return static_cast<js::Wrap<T>*>(pack_(object, ajs_typeid(*object)));
  }
  template<class T>
  static inline Wrap<T>* pack(T* object, uint64 type_id) {
    return static_cast<js::Wrap<T>*>(pack_(object, type_id));
  }
  
private:
  static WrapObject* unpack_(Local<JSObject> object);
  static WrapObject* pack_(Object* object, uint64 type_id);
protected:
  
  Persistent<JSObject> handle_;
  Data* data_;
  
  av_def_inl_cls(Inl);
  
  friend class Allocator;
};

/**
 * @class Wrap utils
 */
template<class T = Object> class AV_EXPORT Wrap: public WrapObject {
  Wrap() = delete;
public:
  typedef T Type;
  
  /**
   * @func unpack()
   */
  static inline Wrap<T>* unpack(Local<JSObject> value) {
    return WrapObject::unpack<T>(value);
  }
  inline T* self() {
    return reinterpret_cast<T*>(this + 1);
  }
};

/**
 * @func start
 */
AV_EXPORT int start(int argc, char* argv[]);

/**
 * @func start
 */
AV_EXPORT int start(cString& args);

ajs_end
#endif

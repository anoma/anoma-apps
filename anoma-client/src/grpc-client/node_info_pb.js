// source: node_info.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {missingRequire} reports error on implicit type usages.
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
// @ts-nocheck

var jspb = require('google-protobuf');
var goog = jspb;
var global =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof window !== 'undefined' && window) ||
    (typeof global !== 'undefined' && global) ||
    (typeof self !== 'undefined' && self) ||
    (function () { return this; }).call(null) ||
    Function('return this')();

goog.exportSymbol('proto.Anoma.Protobuf.NodeInfo', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.Anoma.Protobuf.NodeInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.Anoma.Protobuf.NodeInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.Anoma.Protobuf.NodeInfo.displayName = 'proto.Anoma.Protobuf.NodeInfo';
}



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.Anoma.Protobuf.NodeInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.Anoma.Protobuf.NodeInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.Anoma.Protobuf.NodeInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.Anoma.Protobuf.NodeInfo.toObject = function(includeInstance, msg) {
  var f, obj = {
nodeId: msg.getNodeId_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.Anoma.Protobuf.NodeInfo}
 */
proto.Anoma.Protobuf.NodeInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.Anoma.Protobuf.NodeInfo;
  return proto.Anoma.Protobuf.NodeInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.Anoma.Protobuf.NodeInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.Anoma.Protobuf.NodeInfo}
 */
proto.Anoma.Protobuf.NodeInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setNodeId(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.Anoma.Protobuf.NodeInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.Anoma.Protobuf.NodeInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.Anoma.Protobuf.NodeInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.Anoma.Protobuf.NodeInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getNodeId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
};


/**
 * optional bytes node_id = 1;
 * @return {string}
 */
proto.Anoma.Protobuf.NodeInfo.prototype.getNodeId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes node_id = 1;
 * This is a type-conversion wrapper around `getNodeId()`
 * @return {string}
 */
proto.Anoma.Protobuf.NodeInfo.prototype.getNodeId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getNodeId()));
};


/**
 * optional bytes node_id = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getNodeId()`
 * @return {!Uint8Array}
 */
proto.Anoma.Protobuf.NodeInfo.prototype.getNodeId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getNodeId()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.Anoma.Protobuf.NodeInfo} returns this
 */
proto.Anoma.Protobuf.NodeInfo.prototype.setNodeId = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


goog.object.extend(exports, proto.Anoma.Protobuf);
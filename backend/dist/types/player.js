"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionProficiency = exports.Personality = void 0;
/**
 * Player personality traits
 */
var Personality;
(function (Personality) {
    Personality["Ambitious"] = "Ambitious";
    Personality["Determined"] = "Determined";
    Personality["Professional"] = "Professional";
    Personality["Resilient"] = "Resilient";
    Personality["TeamPlayer"] = "Team Player";
    Personality["Temperamental"] = "Temperamental";
    Personality["Unambitious"] = "Unambitious";
    Personality["Unprofessional"] = "Unprofessional";
    Personality["Selfish"] = "Selfish";
    Personality["Leader"] = "Leader";
})(Personality || (exports.Personality = Personality = {}));
/**
 * Player position proficiency
 */
var PositionProficiency;
(function (PositionProficiency) {
    PositionProficiency["Natural"] = "Natural";
    PositionProficiency["Accomplished"] = "Accomplished";
    PositionProficiency["Competent"] = "Competent";
    PositionProficiency["Awkward"] = "Awkward";
    PositionProficiency["Unconvincing"] = "Unconvincing";
})(PositionProficiency || (exports.PositionProficiency = PositionProficiency = {}));

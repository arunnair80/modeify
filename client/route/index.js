var config = require('config');
var convert = require('convert');
var debug = require('debug')(config.application() + ':route');
var model = require('model');
var defaults = require('model-defaults');
var session = require('session');

/**
 * Expose `Route`
 */

var Route = module.exports = model('Route')
  .use(defaults({
    days: 235,
    bikeSpeed: 4.1,
    parkingCost: 10,
    transit: [],
    vmtRate: 0.56,
    walkSpeed: 1.4
  }))
  .attr('id')
  .attr('access')
  .attr('bikeCalories')
  .attr('bikeDistance')
  .attr('bikeSpeed')
  .attr('calories')
  .attr('cost')
  .attr('days')
  .attr('driveDistance')
  .attr('egress')
  .attr('emissions')
  .attr('modes')
  .attr('parkingCost')
  .attr('score')
  .attr('stats')
  .attr('time')
  .attr('transfers')
  .attr('transitCost')
  .attr('transit')
  .attr('trips')
  .attr('vmtRate')
  .attr('walkCalories')
  .attr('walkDistance')
  .attr('walkSpeed');

/**
 * Update scoring
 */

Route.prototype.updateScoring = function() {
  this.emit('change calculatedCost', this.calculatedCost());
  this.emit('change calculatedCalories', this.calculatedCalories());
};

/**
 * Average trip length in minutes
 */

Route.prototype.average = function() {
  return Math.round(this.time());
};

/**
 * Trip multiplier
 */

Route.prototype.tripm = function() {
  return session.plan().per_year() ? this.days() : 1;
};

/**
 * Cost
 */

Route.prototype.calculatedCost = function() {
  if (this.cost() === 0) return false;
  var total = this.cost() * this.tripm();
  return total > 1000 ? (total / 1000).toFixed(0) + 'k' : total.toFixed(0);
};

/**
 * Transit Cost
 */

Route.prototype.transitCosts = function() {
  if (!this.transitCost()) return false;
  return this.transitCost().toFixed(2);
};

/**
 * Calories
 */

Route.prototype.calculatedCalories = function() {
  if (this.calories() === 0) return false;
  var total = this.calories() * this.tripm();
  return total > 1000 ? (total / 1000).toFixed(0) + 'k' : total.toFixed(0);
};

/**
 * Frequency
 */

Route.prototype.frequency = function() {
  var trips = this.trips();
  if (!trips) return false;

  var plan = session.plan();
  var start = plan.start_time();
  var end = plan.end_time();

  return Math.round(trips / (end - start));
};

/**
 * Walk/Bike distances rounded
 */

Route.prototype.driveDistances = function() {
  if (this.modes().indexOf('car') === -1) return false;
  return Math.round(convert.metersToMiles(this.driveDistance()) * 2) / 2;
};

Route.prototype.bikeDistances = function() {
  if (this.modes().indexOf('bicycle') === -1) return false;
  return Math.round(convert.metersToMiles(this.bikeDistance()) * 2) / 2;
};

Route.prototype.walkDistances = function() {
  if (this.modes().indexOf('walk') === -1) return false;
  return Math.round(convert.metersToMiles(this.walkDistance()) * 2) / 2;
};

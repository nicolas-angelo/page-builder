//import lodash
import _ from 'lodash';

const isArrayEqual = function (x: any[], y: any[]) {
	return _(x).differenceWith(y, _.isEqual).isEmpty();
};

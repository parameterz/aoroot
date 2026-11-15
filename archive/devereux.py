#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
import views

updated_on = "31 Mar 2013"

class devereuxHandler(views.BaseHandler):
    def get(self):
        ''' displays a worksheet for calculating aortic root 'z-scores' according to Devereux et al AJC 2012 '''
        self.render('devereux.htm',
            {   'title': 'Two-Dimensional Echo Reference Values for the Aortic Root',
                'subtitle': 'adjusted for age, gender, and body size',
                'description': 'age-adjusted and size-adjusted reference values for the aortic root (aortic valve, sinus of Valsalva) based on Devereux et al., AJC 2012',
                'updated': updated_on
            })

class devereuxCalcHandler(views.BaseHandler):
    def get(self, site, gender, indVar, indVal):
        #calculates the mean, +2, +3, and +4SD limits for either site, over a range of ages
        #determine if indVal is within range
        indLimits = limits[indVar]
        
        results = []
        error = ''

        if float(indVal) >= indLimits[0] and float(indVal) <= indLimits[1]:
            data = rootData[site][indVar]
            if gender == 'm' or gender == 'M':
                b3 = data['b3']
            else:
                b3 = 2 * data['b3']
            for age in range(limits['age'][0], limits['age'][1]):
                #calculate the mean for each age, then the upper limits
                mean = data['int'] + (data['b1'] * age/10.0 ) + (data['b2'] * float(indVal)) + b3
                ninetyfive = mean + 1.65 * data['se'] #95%-ile
                plus2 = mean + 2.0 * data['se']
                plus3 = mean + 3.0 * data['se']
                plus4 = mean + 4.0 * data['se']
                results.append( {age: [mean, ninetyfive, plus2, plus3, plus4]})
        else:
            error = '%s out of range: expecting values within range %.2f - %.2f' %(indVar, indLimits[0], indLimits[1])
        
        self.render('devereuxResults.htm', 
            {   'site': fullNames[site],
                'gender': gender,
                'indVar': indVar,
                'indVal': indVal,
                'results': results,
                'error': error,
                'updated': updated_on
            })
    

rootData = {
    'sov': {
        'bsa': {
            'int': 2.423,
            'b1': 0.090, #age(decade)
            'b2': 0.461, #bsa
            'b3': -0.267, #gender *1 for males, *2 for females
            'se': 0.261
        },
        'ht': {
            'int': 1.519,
            'b1': 0.10, #age(decade)
            'b2': 0.010, #ht
            'b3': -0.247, #gender *1 for males, *2 for females
            'se': 0.215
        }
    },
    'aov': {
        'bsa': {
            'int': 1.439,
            'b1': 0.020, #age(decade)
            'b2': 0.457, #bsa
            'b3': -0.121, #gender *1 for males, *2 for females
            'se': 0.070
        },
        'ht': {
            'int': 1.535,
            'b1': 0.010, #age(decade)
            'b2': 0.004, #ht
            'b3': -0.152, #gender *1 for males, *2 for females
            'se': 0.113
        }        
    }
}

limits = {
    'age': (15, 86),
    'ht': (143, 206), 
    'bsa': (1.13, 2.41)
}

fullNames ={
    'aov': 'aortic valve',
    'sov': 'sinus of Valsalva'
}
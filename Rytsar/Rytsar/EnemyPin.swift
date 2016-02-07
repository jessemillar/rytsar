//
//  Enemy.swift
//  Rytsar
//
//  Created by Jesse Millar on 2/6/16.
//  Copyright © 2016 Jesse Millar. All rights reserved.
//

import Foundation
import MapKit

class EnemyPin: NSObject, MKAnnotation {
    let coordinate: CLLocationCoordinate2D
    
    init(coordinate: CLLocationCoordinate2D) {
        self.coordinate = coordinate
        
        super.init()
    }
}
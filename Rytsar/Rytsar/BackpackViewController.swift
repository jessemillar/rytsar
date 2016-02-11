//
//  FirstViewController.swift
//  Rytsar
//
//  Created by Jesse Millar on 1/24/16.
//  Copyright © 2016 Jesse Millar. All rights reserved.
//

import UIKit

class BackpackViewController: UIViewController {    
    @IBOutlet weak var AmmoLabel: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }
    
    override func viewDidAppear(animated: Bool) {
        AmmoLabel.text = "Ammo: \(Globals.ammo)"
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
}


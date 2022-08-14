import { Component, OnInit } from '@angular/core';
import {Product} from '../../common/product';
import {ProductService} from '../../services/product.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[];
  currentCategoryId: number=1;
  previousCategoryId: number=1;
  searchMode:boolean=false;

  // new properties for paginaton
  thePageNumber:number=1;
  thePageSize:number=2;
  theTotalElements:number=0;

  previousKeyword:string=null;

  constructor(private productService: ProductService,private route:ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(()=>{
      this.listProducts();
    })

  }

  listProducts() {
    this.searchMode=this.route.snapshot.paramMap.has('keyword');

    if(this.searchMode){
      this.handleSearchProducts();

    }else {
      this.handleListProducts();
    }
  }


  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword');

    //if we have a diff keyword than previous
    //then set thePageNumber to 1

    if(this.previousKeyword!=theKeyword){
      this.thePageNumber=1;
    }
    this.previousKeyword=theKeyword;

    // now search for the products using keyword
    this.productService.searchProductsPaginate(this.thePageNumber - 1,
      this.thePageSize,
      theKeyword).subscribe(this.processResult());

  }


  handleListProducts(){

    // check if "id" param is available
    const hasCategoryId:boolean = this.route.snapshot.paramMap.has('id');

    if(hasCategoryId){
      // get the "id" param string convert string to a number using the "+" symbol
      this.currentCategoryId=+this.route.snapshot.paramMap.get('id');
    } else {
      this.currentCategoryId=1;
    }

    //check if we have a diff category than previous
    // note angular will reuse a component if it is currently being viewed
    //

    // if we have diff category id than previous
    // then set the thePageNumber back to 1

    if(this.previousCategoryId != this.currentCategoryId){
      this.thePageNumber=1;
    }


    this.previousCategoryId=this.currentCategoryId;
    console.log(`currentCategoryId=${this.currentCategoryId},thePageNumber=${this.thePageNumber}`);

    // get the product for the given category id
    this.productService.getProductListPaginate(this.thePageNumber-1,
      this.thePageSize,
      this.currentCategoryId)
      .subscribe(this.processResult());

  }


  processResult() {
    return data=>{
      this.products=data._embedded.products;
      this.thePageNumber=data.page.number+1;
      this.thePageSize=data.page.size;
      this.theTotalElements=data.page.totalElements;
    };
  }

  updatePageSize(pageSize: number) {
    this.thePageSize = pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }



}
